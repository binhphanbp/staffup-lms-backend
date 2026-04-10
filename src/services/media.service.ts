import path from 'node:path';
import type { UploadApiOptions, UploadApiResponse } from 'cloudinary';
import { env } from '@/config/env.config';
import { getCloudinaryClient } from '@/config/cloudinary.config';
import type { MediaFolderListQuery, MediaListQuery } from '@/schemas/media.schema';

type CloudinaryResourceType = 'auto' | 'image' | 'video' | 'raw';

interface UploadMediaOptions {
  folder?: string;
  publicId?: string;
  resourceType?: CloudinaryResourceType;
  overwrite?: boolean;
}

interface UploadMediaResult {
  assetId: string;
  publicId: string;
  version: number;
  width: number | null;
  height: number | null;
  format: string | null;
  resourceType: string;
  bytes: number;
  duration: number | null;
  originalFilename: string;
  secureUrl: string;
  playbackUrl: string;
  folder: string | null;
}

interface MediaListItem {
  assetId: string;
  publicId: string;
  version: number;
  width: number | null;
  height: number | null;
  format: string | null;
  resourceType: string;
  bytes: number;
  duration: number | null;
  createdAt: string | null;
  secureUrl: string;
  playbackUrl: string;
  folder: string | null;
  originalFilename: string | null;
}

interface MediaListResult {
  items: MediaListItem[];
  nextCursor: string | null;
  folder: string;
  resourceType: Exclude<CloudinaryResourceType, 'auto'>;
}

interface MediaFolderItem {
  name: string;
  path: string;
}

interface MediaFolderListResult {
  items: MediaFolderItem[];
  nextCursor: string | null;
  path: string | null;
}

export class MediaService {
  private static extractFolderFromPublicId(publicId: string) {
    const segments = publicId.split('/');

    if (segments.length <= 1) {
      return null;
    }

    return segments.slice(0, -1).join('/');
  }

  private static normalizeFolder(folder?: string) {
    const value = folder?.trim() || env.CLOUDINARY_UPLOAD_FOLDER;
    return value.replace(/^\/+|\/+$/g, '') || undefined;
  }

  private static inferResourceType(file: Express.Multer.File): CloudinaryResourceType {
    if (file.mimetype.startsWith('video/')) {
      return 'video';
    }

    if (file.mimetype.startsWith('image/')) {
      return 'image';
    }

    return 'raw';
  }

  private static buildPublicId(file: Express.Multer.File, explicitPublicId?: string) {
    if (explicitPublicId?.trim()) {
      return explicitPublicId.trim();
    }

    const extension = path.extname(file.originalname);
    return path.basename(file.originalname, extension).trim() || undefined;
  }

  private static createUploadOptions(
    file: Express.Multer.File,
    options: UploadMediaOptions,
  ): UploadApiOptions {
    const folder = this.normalizeFolder(options.folder);

    return {
      resource_type: options.resourceType ?? this.inferResourceType(file),
      folder,
      public_id: this.buildPublicId(file, options.publicId),
      overwrite: options.overwrite ?? false,
      use_filename: !options.publicId,
      unique_filename: !options.publicId,
      filename_override: file.originalname,
    };
  }

  private static uploadBuffer(
    file: Express.Multer.File,
    options: UploadApiOptions,
  ): Promise<UploadApiResponse> {
    const cloudinary = getCloudinaryClient();

    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result) {
          reject(new Error('Cloudinary upload did not return a result.'));
          return;
        }

        resolve(result);
      });

      stream.end(file.buffer);
    });
  }

  static async upload(
    file: Express.Multer.File,
    options: UploadMediaOptions = {},
  ): Promise<UploadMediaResult> {
    const uploadOptions = this.createUploadOptions(file, options);
    const result = await this.uploadBuffer(file, uploadOptions);

    return {
      assetId: result.asset_id,
      publicId: result.public_id,
      version: result.version,
      width: result.width ?? null,
      height: result.height ?? null,
      format: result.format ?? null,
      resourceType: result.resource_type,
      bytes: result.bytes,
      duration: typeof result.duration === 'number' ? result.duration : null,
      originalFilename: result.original_filename,
      secureUrl: result.secure_url,
      playbackUrl: result.secure_url,
      folder: this.extractFolderFromPublicId(result.public_id),
    };
  }

  static async listByFolder(query: MediaListQuery): Promise<MediaListResult> {
    const cloudinary = getCloudinaryClient();
    const folder = this.normalizeFolder(query.folder);
    const resourceType = query.resourceType ?? 'video';

    let result: any;

    try {
      result = await cloudinary.api.resources_by_asset_folder(folder, {
        max_results: query.maxResults,
        next_cursor: query.nextCursor,
        direction: 'desc',
      });
    } catch (error: any) {
      const errorMessage = typeof error?.message === 'string' ? error.message.toLowerCase() : '';
      const shouldFallbackToPrefix =
        errorMessage.includes('fixed folder mode') || errorMessage.includes('by_asset_folder');

      if (!shouldFallbackToPrefix) {
        throw error;
      }

      result = await cloudinary.api.resources({
        type: 'upload',
        prefix: folder ? `${folder}/` : undefined,
        resource_type: resourceType,
        max_results: query.maxResults,
        next_cursor: query.nextCursor,
        direction: 'desc',
      });
    }

    const items = Array.isArray(result.resources)
      ? result.resources
          .map((resource: any) => ({
            assetId: resource.asset_id,
            publicId: resource.public_id,
            version: resource.version,
            width: resource.width ?? null,
            height: resource.height ?? null,
            format: resource.format ?? null,
            resourceType: resource.resource_type,
            bytes: resource.bytes,
            duration: typeof resource.duration === 'number' ? resource.duration : null,
            createdAt: resource.created_at ?? null,
            secureUrl: resource.secure_url,
            playbackUrl: resource.secure_url,
            folder: resource.asset_folder ?? this.extractFolderFromPublicId(resource.public_id),
            originalFilename: resource.original_filename ?? null,
          }))
          .filter((resource: MediaListItem) => resource.resourceType === resourceType)
      : [];

    return {
      items,
      nextCursor: result.next_cursor ?? null,
      folder: folder ?? '',
      resourceType,
    };
  }

  static async listFolders(query: MediaFolderListQuery): Promise<MediaFolderListResult> {
    const cloudinary = getCloudinaryClient();
    const path = query.path?.trim() ? (this.normalizeFolder(query.path) ?? null) : null;

    const result = path
      ? await cloudinary.api.sub_folders(path, {
          max_results: query.maxResults,
          next_cursor: query.nextCursor,
        })
      : await cloudinary.api.root_folders({
          max_results: query.maxResults,
          next_cursor: query.nextCursor,
        });

    const folders = Array.isArray(result.folders) ? result.folders : [];

    return {
      items: folders.map((folder: any) => ({
        name: folder.name,
        path: folder.path,
      })),
      nextCursor: result.next_cursor ?? null,
      path,
    };
  }
}
