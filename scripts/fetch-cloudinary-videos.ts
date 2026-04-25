import 'dotenv/config';
import { getCloudinaryClient } from '../src/config/cloudinary.config';

/**
 * Script để lấy danh sách videos từ Cloudinary
 * Sử dụng để kiểm tra videos có sẵn và tạo seed data
 */

interface CloudinaryResource {
  public_id: string;
  format: string;
  version: number;
  resource_type: string;
  type: string;
  created_at: string;
  bytes: number;
  width: number;
  height: number;
  folder: string;
  url: string;
  secure_url: string;
  duration?: number;
}

interface CloudinaryResponse {
  resources: CloudinaryResource[];
  next_cursor?: string;
}

async function fetchAllVideos(folder?: string): Promise<CloudinaryResource[]> {
  try {
    const cloudinary = getCloudinaryClient();

    // eslint-disable-next-line no-console
    console.log('🔍 Fetching videos from Cloudinary...\n');

    const options: Record<string, unknown> = {
      type: 'upload',
      resource_type: 'video',
      max_results: 500,
    };

    if (folder) {
      options.prefix = folder;
      // eslint-disable-next-line no-console
      console.log(`📁 Folder: ${folder}\n`);
    }

    const result: CloudinaryResponse = await cloudinary.api.resources(options);

    // eslint-disable-next-line no-console
    console.log(`✅ Found ${result.resources.length} videos\n`);

    return result.resources;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error fetching videos:', errorMessage);
    throw error;
  }
}

async function fetchVideosByFolder(folder: string): Promise<CloudinaryResource[]> {
  return fetchAllVideos(folder);
}

async function listFolders(path?: string): Promise<string[]> {
  try {
    const cloudinary = getCloudinaryClient();

    // eslint-disable-next-line no-console
    console.log('📂 Listing folders...\n');

    const result = path
      ? await cloudinary.api.sub_folders(path)
      : await cloudinary.api.root_folders();

    const folders = result.folders.map((f: Record<string, unknown>) => f.path as string);

    // eslint-disable-next-line no-console
    console.log(`✅ Found ${folders.length} folders:`);
    // eslint-disable-next-line no-console
    folders.forEach((f: string) => console.log(`   - ${f}`));
    // eslint-disable-next-line no-console
    console.log('');

    return folders;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error listing folders:', errorMessage);
    throw error;
  }
}

function groupVideosByFolder(videos: CloudinaryResource[]): Record<string, CloudinaryResource[]> {
  const grouped: Record<string, CloudinaryResource[]> = {};

  videos.forEach((video) => {
    const folder = video.folder || 'root';
    if (!grouped[folder]) {
      grouped[folder] = [];
    }
    grouped[folder].push(video);
  });

  return grouped;
}

function printVideoSummary(videos: CloudinaryResource[]) {
  // eslint-disable-next-line no-console
  console.log('═══════════════════════════════════════════════════════════════');
  // eslint-disable-next-line no-console
  console.log('   VIDEO SUMMARY');
  // eslint-disable-next-line no-console
  console.log('═══════════════════════════════════════════════════════════════\n');

  const grouped = groupVideosByFolder(videos);

  Object.entries(grouped).forEach(([folder, folderVideos]) => {
    // eslint-disable-next-line no-console
    console.log(`📁 ${folder} (${folderVideos.length} videos)`);

    folderVideos.forEach((video) => {
      const durationMin = video.duration ? Math.floor(video.duration / 60) : 0;
      const durationSec = video.duration ? Math.floor(video.duration % 60) : 0;
      const sizeMB = (video.bytes / (1024 * 1024)).toFixed(2);

      // eslint-disable-next-line no-console
      console.log(`   📹 ${video.public_id}`);
      // eslint-disable-next-line no-console
      console.log(`      Duration: ${durationMin}:${durationSec.toString().padStart(2, '0')}`);
      // eslint-disable-next-line no-console
      console.log(`      Size: ${sizeMB} MB`);
      // eslint-disable-next-line no-console
      console.log(`      URL: ${video.secure_url}`);
      // eslint-disable-next-line no-console
      console.log('');
    });
  });

  const totalSize = videos.reduce((sum, v) => sum + v.bytes, 0);
  const totalDuration = videos.reduce((sum, v) => sum + (v.duration || 0), 0);

  // eslint-disable-next-line no-console
  console.log('═══════════════════════════════════════════════════════════════');
  // eslint-disable-next-line no-console
  console.log(`Total Videos: ${videos.length}`);
  // eslint-disable-next-line no-console
  console.log(`Total Size: ${(totalSize / (1024 * 1024 * 1024)).toFixed(2)} GB`);
  // eslint-disable-next-line no-console
  console.log(
    `Total Duration: ${Math.floor(totalDuration / 3600)}h ${Math.floor((totalDuration % 3600) / 60)}m`,
  );
  // eslint-disable-next-line no-console
  console.log('═══════════════════════════════════════════════════════════════\n');
}

function generateSeedData(videos: CloudinaryResource[]): string {
  const grouped = groupVideosByFolder(videos);

  let seedCode = '// Generated seed data from Cloudinary\n\n';
  seedCode += 'const CLOUDINARY_VIDEOS = {\n';

  Object.entries(grouped).forEach(([folder, folderVideos]) => {
    const folderName = folder.replace(/[^a-zA-Z0-9]/g, '_');
    seedCode += `  ${folderName}: [\n`;

    folderVideos.forEach((video) => {
      seedCode += `    {\n`;
      seedCode += `      publicId: '${video.public_id}',\n`;
      seedCode += `      url: '${video.secure_url}',\n`;
      seedCode += `      duration: ${video.duration || 0},\n`;
      seedCode += `      format: '${video.format}',\n`;
      seedCode += `    },\n`;
    });

    seedCode += `  ],\n`;
  });

  seedCode += '};\n\n';
  seedCode += 'module.exports = { CLOUDINARY_VIDEOS };\n';

  return seedCode;
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const param = args[1];

  try {
    switch (command) {
      case 'list-folders':
        await listFolders(param);
        break;

      case 'fetch-videos': {
        const videos = await fetchAllVideos(param);
        printVideoSummary(videos);
        break;
      }

      case 'generate-seed': {
        const allVideos = await fetchAllVideos(param);
        const seedData = generateSeedData(allVideos);
        console.log(seedData);
        break;
      }

      default:
        // eslint-disable-next-line no-console
        console.log('Usage:');
        // eslint-disable-next-line no-console
        console.log('  npm run fetch-videos list-folders [path]');
        // eslint-disable-next-line no-console
        console.log('  npm run fetch-videos fetch-videos [folder]');
        // eslint-disable-next-line no-console
        console.log('  npm run fetch-videos generate-seed [folder]');
        // eslint-disable-next-line no-console
        console.log('');
        // eslint-disable-next-line no-console
        console.log('Examples:');
        // eslint-disable-next-line no-console
        console.log('  npm run fetch-videos list-folders');
        // eslint-disable-next-line no-console
        console.log('  npm run fetch-videos fetch-videos staffup-lms/courses');
        // eslint-disable-next-line no-console
        console.log('  npm run fetch-videos generate-seed staffup-lms/courses');
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('\n❌ Error:', errorMessage);
    process.exit(1);
  }
}

main();
