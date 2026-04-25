const { createSeedContext, disposeSeedContext } = require('../shared/client');
const { getCourseThumbnailUrl } = require('../shared/thumbnail-helper');

/**
 * COURSE SEED FROM CLOUDINARY VIDEOS
 * Auto-generated from actual Cloudinary videos
 */

// Thumbnail mapping for courses - DEPRECATED: Use thumbnail-helper.js instead
function getThumbnailId(slug) {
  // This function is kept for backward compatibility
  // New code should use getCourseThumbnailUrl from thumbnail-helper.js
  const thumbnails = {
    'python-programming-basics-advanced': '1515879097580-5c6f82d6b1b3',
    'cpp-programming-fundamentals': '1542831371-29b0f74f9713',
    'devops-aws-complete-guide': '1667372393119-3d4c48d07fc9',
    'uiux-design-figma': '1561070791-2526d30994b5',
    'visily-ai-ui-design': '1558655146-364817c7b074',
    'php-mysql-web-development': '1593642532842-98d0fd5ebc1a',
    'nextjs-typescript-modern-web': '1633356122544-f134324a6cee',
    'git-github-version-control': '1556075798-4825dfaaf498',
    'vuejs-progressive-framework': '1587620962564-65b5c6bdc1b8',
    'angularjs-fundamentals': '1593642634315-48f5335c3f4d',
  };
  
  return thumbnails[slug] || '1515879097580-5c6f82d6b1b3'; // Default to Python image
}

const COURSES_DATA = [
  {
    title: 'Python Programming - From Basics to Advanced',
    slug: 'python-programming-basics-advanced',
    description: `Khóa học Python toàn diện từ cơ bản đến nâng cao.
    
    Nội dung:
    - Cài đặt Python và PyCharm
    - Biến và kiểu dữ liệu
    - Cấu trúc dữ liệu: List, Tuple, Dictionary
    - Functions và modules
    - Lệnh điều kiện và vòng lặp
    - Xử lý file và exception handling`,
    categorySlug: 'programming-languages',
    tags: ["python","programming","beginner"],
    estimatedDurationMinutes: 480,
    thumbnailUrl: 'https://res.cloudinary.com/demo/image/upload/v1/courses/python-programming-basics-advanced-thumb.jpg',
    status: 'published',
    modules: [
      {
        title: 'Module 1',
        orderIndex: 1,
        lessons: [
          {
            title: '16 Python - Bài 2 - Cài đặt Python và PyCharm - YouTube yvckkv',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775844250/16_Python_-_B%C3%A0i_2_-_C%C3%A0i_%C4%91%E1%BA%B7t_Python_v%C3%A0_PyCharm_-_YouTube_yvckkv.mp4',
            durationSeconds: 600,
            orderIndex: 1,
            isPreview: true,
          },
          {
            title: '16 Python - Bài 1 - Introduction - YouTube fu4bfp',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775844250/16_Python_-_B%C3%A0i_1_-_Introduction_-_YouTube_fu4bfp.mp4',
            durationSeconds: 600,
            orderIndex: 2,
            isPreview: false,
          },
          {
            title: '16 Python - Bài 3 - Viết chương trình Python đầu tiên - YouTube qv9kjv',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775844249/16_Python_-_B%C3%A0i_3_-_Vi%E1%BA%BFt_ch%C6%B0%C6%A1ng_tr%C3%ACnh_Python_%C4%91%E1%BA%A7u_ti%C3%AAn_-_YouTube_qv9kjv.mp4',
            durationSeconds: 600,
            orderIndex: 3,
            isPreview: false,
          },
          {
            title: '16 Python - Bài 4 - Biến và Kiểu dữ liệu - YouTube qcip8l',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775844248/16_Python_-_B%C3%A0i_4_-_Bi%E1%BA%BFn_v%C3%A0_Ki%E1%BB%83u_d%E1%BB%AF_li%E1%BB%87u_-_YouTube_qcip8l.mp4',
            durationSeconds: 600,
            orderIndex: 4,
            isPreview: false,
          },
          {
            title: '16 Python - Bài 6 - Dữ liệu dạng số và các hàm toán học - YouTube hy7neu',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775844247/16_Python_-_B%C3%A0i_6_-_D%E1%BB%AF_li%E1%BB%87u_d%E1%BA%A1ng_s%E1%BB%91_v%C3%A0_c%C3%A1c_h%C3%A0m_to%C3%A1n_h%E1%BB%8Dc_-_YouTube_hy7neu.mp4',
            durationSeconds: 600,
            orderIndex: 5,
            isPreview: false,
          },
        ],
      },
      {
        title: 'Module 2',
        orderIndex: 2,
        lessons: [
          {
            title: '16 Python - Bài 5 - Thao tác với string - YouTube hhitwv',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775844247/16_Python_-_B%C3%A0i_5_-_Thao_t%C3%A1c_v%E1%BB%9Bi_string_-_YouTube_hhitwv.mp4',
            durationSeconds: 600,
            orderIndex: 1,
            isPreview: false,
          },
          {
            title: '16 Python - Bài 7 - Nhận dữ liệu người dùng nhập vào - YouTube fo6byq',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775844247/16_Python_-_B%C3%A0i_7_-_Nh%E1%BA%ADn_d%E1%BB%AF_li%E1%BB%87u_ng%C6%B0%E1%BB%9Di_d%C3%B9ng_nh%E1%BA%ADp_v%C3%A0o_-_YouTube_fo6byq.mp4',
            durationSeconds: 600,
            orderIndex: 2,
            isPreview: false,
          },
          {
            title: '16 Python - Bài 9 - Nối chuỗi với hàm format - YouTube mxfynq',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775844246/16_Python_-_B%C3%A0i_9_-_N%E1%BB%91i_chu%E1%BB%97i_v%E1%BB%9Bi_h%C3%A0m_format_-_YouTube_mxfynq.mp4',
            durationSeconds: 600,
            orderIndex: 3,
            isPreview: false,
          },
          {
            title: '16 Python - Bài 11 - Các hàm thao tác với List - YouTube lujdiu',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775844245/16_Python_-_B%C3%A0i_11_-_C%C3%A1c_h%C3%A0m_thao_t%C3%A1c_v%E1%BB%9Bi_List_-_YouTube_lujdiu.mp4',
            durationSeconds: 600,
            orderIndex: 4,
            isPreview: false,
          },
          {
            title: '16 Python - Bài 10 - Dữ liệu dạng danh sách - YouTube uggl5o',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775844245/16_Python_-_B%C3%A0i_10_-_D%E1%BB%AF_li%E1%BB%87u_d%E1%BA%A1ng_danh_s%C3%A1ch_-_YouTube_uggl5o.mp4',
            durationSeconds: 600,
            orderIndex: 5,
            isPreview: false,
          },
        ],
      },
      {
        title: 'Module 3',
        orderIndex: 3,
        lessons: [
          {
            title: '16 Python - Bài 8 - Ứng dụng máy tính cơ bản - YouTube jba79q',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775844244/16_Python_-_B%C3%A0i_8_-_%E1%BB%A8ng_d%E1%BB%A5ng_m%C3%A1y_t%C3%ADnh_c%C6%A1_b%E1%BA%A3n_-_YouTube_jba79q.mp4',
            durationSeconds: 600,
            orderIndex: 1,
            isPreview: false,
          },
          {
            title: '16 Python - Bài 12 - Cấu trúc dữ liệu tuple. Sự khác nhau giữa tuple và list - YouTube fz7vmc',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775844244/16_Python_-_B%C3%A0i_12_-_C%E1%BA%A5u_tr%C3%BAc_d%E1%BB%AF_li%E1%BB%87u_tuple._S%E1%BB%B1_kh%C3%A1c_nhau_gi%E1%BB%AFa_tuple_v%C3%A0_list_-_YouTube_fz7vmc.mp4',
            durationSeconds: 600,
            orderIndex: 2,
            isPreview: false,
          },
          {
            title: '16 Python - Bài 13 - Thao tác với hàm - YouTube rmhayt',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775844244/16_Python_-_B%C3%A0i_13_-_Thao_t%C3%A1c_v%E1%BB%9Bi_h%C3%A0m_-_YouTube_rmhayt.mp4',
            durationSeconds: 600,
            orderIndex: 3,
            isPreview: false,
          },
          {
            title: '16 Python - Bài 14 - Lệnh return trong hàm - YouTube okjqtw',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775844243/16_Python_-_B%C3%A0i_14_-_L%E1%BB%87nh_return_trong_h%C3%A0m_-_YouTube_okjqtw.mp4',
            durationSeconds: 600,
            orderIndex: 4,
            isPreview: false,
          },
          {
            title: '16 Python - Bài 15 - Lệnh if elif và else - YouTube ds3oge',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775844242/16_Python_-_B%C3%A0i_15_-_L%E1%BB%87nh_if_elif_v%C3%A0_else_-_YouTube_ds3oge.mp4',
            durationSeconds: 600,
            orderIndex: 5,
            isPreview: false,
          },
        ],
      },
      {
        title: 'Module 4',
        orderIndex: 4,
        lessons: [
          {
            title: '16 Python - Bài 15 - Lệnh if elif và else - YouTube yxr9rm',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775843875/16_Python_-_B%C3%A0i_15_-_L%E1%BB%87nh_if_elif_v%C3%A0_else_-_YouTube_yxr9rm.mp4',
            durationSeconds: 600,
            orderIndex: 1,
            isPreview: false,
          },
        ],
      },
    ],
  },

  {
    title: 'Visily - AI-Powered UI Design Tool',
    slug: 'visily-ai-ui-design',
    description: `Thiết kế UI nhanh chóng với Visily AI.
    
    Bạn sẽ học:
    - Visily basics
    - AI features
    - Screenshot to design
    - Prototyping
    - Collaboration`,
    categorySlug: 'design',
    tags: ["visily","ui-design","ai"],
    estimatedDurationMinutes: 300,
    thumbnailUrl: 'https://res.cloudinary.com/demo/image/upload/v1/courses/visily-ai-ui-design-thumb.jpg',
    status: 'published',
    modules: [
      {
        title: 'Module 1',
        orderIndex: 1,
        lessons: [
          {
            title: '16 Announcing Visily 4.0- Smarter more capable AI - YouTube dful3v',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775844218/16_Announcing_Visily_4.0-_Smarter_more_capable_AI_-_YouTube_dful3v.mp4',
            durationSeconds: 600,
            orderIndex: 1,
            isPreview: true,
          },
          {
            title: '16 Basic Visily Walkthrough - YouTube lp9rqw',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775844218/16_Basic_Visily_Walkthrough_-_YouTube_lp9rqw.mp4',
            durationSeconds: 600,
            orderIndex: 2,
            isPreview: false,
          },
          {
            title: '16 Visily Screenshot Extension- Full-Page Element Capture Editable Designs - YouTube vbzebm',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775844218/16_Visily_Screenshot_Extension-_Full-Page_Element_Capture_Editable_Designs_-_YouTube_vbzebm.mp4',
            durationSeconds: 600,
            orderIndex: 3,
            isPreview: false,
          },
          {
            title: '16 Exploring Overlooked AI Features of Visily - Visily s AI Features you might have missed - YouTube',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775844217/16_Exploring_Overlooked_AI_Features_of_Visily_-_Visily_s_AI_Features_you_might_have_missed_-_YouTube_kc0hls.mp4',
            durationSeconds: 600,
            orderIndex: 4,
            isPreview: false,
          },
          {
            title: '16 Introducing Visily Auto-Prototyping - YouTube b6wrsp',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775844215/16_Introducing_Visily_Auto-Prototyping_-_YouTube_b6wrsp.mp4',
            durationSeconds: 600,
            orderIndex: 5,
            isPreview: false,
          },
        ],
      },
      {
        title: 'Module 2',
        orderIndex: 2,
        lessons: [
          {
            title: '16 Effortless Design with Visily- A Walkthrough of Diagram Templates Pt. 1 - YouTube tht77q',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775844214/16_Effortless_Design_with_Visily-_A_Walkthrough_of_Diagram_Templates_Pt._1_-_YouTube_tht77q.mp4',
            durationSeconds: 600,
            orderIndex: 1,
            isPreview: false,
          },
          {
            title: '16 Mastering Visily- Discover Visilys Hotkeys - YouTube nymln4',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775844215/16_Mastering_Visily-_Discover_Visilys_Hotkeys_-_YouTube_nymln4.mp4',
            durationSeconds: 600,
            orderIndex: 2,
            isPreview: false,
          },
          {
            title: '16 How Visily Makes It Easy for Beginners to Create Stunning UI Mockups - YouTube nzs8wc',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775844215/16_How_Visily_Makes_It_Easy_for_Beginners_to_Create_Stunning_UI_Mockups_-_YouTube_nzs8wc.mp4',
            durationSeconds: 600,
            orderIndex: 3,
            isPreview: false,
          },
          {
            title: '16 Unlocking Creativity with Visily- Master all our AI Features - YouTube v4onux',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775844213/16_Unlocking_Creativity_with_Visily-_Master_all_our_AI_Features_-_YouTube_v4onux.mp4',
            durationSeconds: 600,
            orderIndex: 4,
            isPreview: false,
          },
          {
            title: '16 Mastering Design Sharing on Visily- A Step-by-Step Guide - YouTube kdn1bj',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775844212/16_Mastering_Design_Sharing_on_Visily-_A_Step-by-Step_Guide_-_YouTube_kdn1bj.mp4',
            durationSeconds: 600,
            orderIndex: 5,
            isPreview: false,
          },
        ],
      },
      {
        title: 'Module 3',
        orderIndex: 3,
        lessons: [
          {
            title: '16 Mastering Screenshot-to-Design with Visily- A Step-by-Step Guide - YouTube ye497l',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775844212/16_Mastering_Screenshot-to-Design_with_Visily-_A_Step-by-Step_Guide_-_YouTube_ye497l.mp4',
            durationSeconds: 600,
            orderIndex: 1,
            isPreview: false,
          },
          {
            title: '16 Mastering Wireframes and Flowcharts Wireflows and Annotations with Visily- A Step-by-Step Guide -',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775844212/16_Mastering_Wireframes_and_Flowcharts_Wireflows_and_Annotations_with_Visily-_A_Step-by-Step_Guide_-_YouTube_ahrqpb.mp4',
            durationSeconds: 600,
            orderIndex: 2,
            isPreview: false,
          },
          {
            title: '16 Mastering Prototype and Presentation with Visily- A Step-by-Step Guide - YouTube jwdpxe',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775844211/16_Mastering_Prototype_and_Presentation_with_Visily-_A_Step-by-Step_Guide_-_YouTube_jwdpxe.mp4',
            durationSeconds: 600,
            orderIndex: 3,
            isPreview: false,
          },
        ],
      },
    ],
  },

  {
    title: 'UI/UX Design with Figma',
    slug: 'uiux-design-figma',
    description: `Thiết kế UI/UX chuyên nghiệp với Figma.
    
    Bạn sẽ học:
    - Figma fundamentals
    - Components và Auto Layout
    - Design systems
    - Prototyping và animation
    - Collaboration và handoff`,
    categorySlug: 'design',
    tags: ["figma","uiux","design"],
    estimatedDurationMinutes: 720,
    thumbnailUrl: 'https://res.cloudinary.com/demo/image/upload/v1/courses/uiux-design-figma-thumb.jpg',
    status: 'published',
    modules: [
      {
        title: 'Module 1',
        orderIndex: 1,
        lessons: [
          {
            title: '16 Mastering Visily s Figma plug-in- A Step-by-Step Guide - YouTube okgp6i',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775844210/16_Mastering_Visily_s_Figma_plug-in-_A_Step-by-Step_Guide_-_YouTube_okgp6i.mp4',
            durationSeconds: 600,
            orderIndex: 1,
            isPreview: true,
          },
          {
            title: '3. Bài 3 tự học Figma - Draw Vector Shapes và Pen Tool - UIUX 2024 - YouTube r9g8kz',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842663/3._B%C3%A0i_3_t%E1%BB%B1_h%E1%BB%8Dc_Figma_-_Draw_Vector_Shapes_v%C3%A0_Pen_Tool_-_UIUX_2024_-_YouTube_r9g8kz.mp4',
            durationSeconds: 600,
            orderIndex: 2,
            isPreview: false,
          },
          {
            title: '1. Bài 1 tự học Figma - Học figma cực dễ sau 30 phút - Xu hướng UI-UX 2024 - YouTube tvwz6k',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842659/1._B%C3%A0i_1_t%E1%BB%B1_h%E1%BB%8Dc_Figma_-_H%E1%BB%8Dc_figma_c%E1%BB%B1c_d%E1%BB%85_sau_30_ph%C3%BAt_-_Xu_h%C6%B0%E1%BB%9Bng_UI-UX_2024_-_YouTube_tvwz6k.mp4',
            durationSeconds: 600,
            orderIndex: 3,
            isPreview: false,
          },
          {
            title: '5. Bài 5 tự học Figma 2025   làm việc với Components nq5igh',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842658/5._B%C3%A0i_5_t%E1%BB%B1_h%E1%BB%8Dc_Figma_2025___l%C3%A0m_vi%E1%BB%87c_v%E1%BB%9Bi_Components_nq5igh.mp4',
            durationSeconds: 600,
            orderIndex: 4,
            isPreview: false,
          },
          {
            title: '8. Bài 8 Figma 2024 - Hướng dẫn thiết kế UIUX 2024 wppvng',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842654/8._B%C3%A0i_8_Figma_2024_-_H%C6%B0%E1%BB%9Bng_d%E1%BA%ABn_thi%E1%BA%BFt_k%E1%BA%BF_UIUX_2024_wppvng.mp4',
            durationSeconds: 600,
            orderIndex: 5,
            isPreview: false,
          },
        ],
      },
      {
        title: 'Module 2',
        orderIndex: 2,
        lessons: [
          {
            title: '2. Bài 2 tự học Figma - Làm việc với Move Scale Frame và Slice Tool - UI-UX 2024 byvhrp',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842656/2._B%C3%A0i_2_t%E1%BB%B1_h%E1%BB%8Dc_Figma_-_L%C3%A0m_vi%E1%BB%87c_v%E1%BB%9Bi_Move_Scale_Frame_v%C3%A0_Slice_Tool_-_UI-UX_2024_byvhrp.mp4',
            durationSeconds: 600,
            orderIndex: 1,
            isPreview: false,
          },
          {
            title: '6. Bài 6 tự học Figma - Constraints và hệ thống lưới wmfnz3',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842655/6._B%C3%A0i_6_t%E1%BB%B1_h%E1%BB%8Dc_Figma_-_Constraints_v%C3%A0_h%E1%BB%87_th%E1%BB%91ng_l%C6%B0%E1%BB%9Bi_wmfnz3.mp4',
            durationSeconds: 600,
            orderIndex: 2,
            isPreview: false,
          },
          {
            title: '9. Bài 9 tự học Figma - Thế nào là UIUX. tohnqt',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842652/9._B%C3%A0i_9_t%E1%BB%B1_h%E1%BB%8Dc_Figma_-_Th%E1%BA%BF_n%C3%A0o_l%C3%A0_UIUX._tohnqt.mp4',
            durationSeconds: 600,
            orderIndex: 3,
            isPreview: false,
          },
          {
            title: '14. Thiết kế UI-UX và cách tạo Auto Layout Figma oj6wn0',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842652/14._Thi%E1%BA%BFt_k%E1%BA%BF_UI-UX_v%C3%A0_c%C3%A1ch_t%E1%BA%A1o_Auto_Layout_Figma_oj6wn0.mp4',
            durationSeconds: 600,
            orderIndex: 4,
            isPreview: false,
          },
          {
            title: '11. Tự học Figma - Hướng dẫn tạo Input Field Interaction với Interactive Component iklztp',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842651/11._T%E1%BB%B1_h%E1%BB%8Dc_Figma_-_H%C6%B0%E1%BB%9Bng_d%E1%BA%ABn_t%E1%BA%A1o_Input_Field_Interaction_v%E1%BB%9Bi_Interactive_Component_iklztp.mp4',
            durationSeconds: 600,
            orderIndex: 5,
            isPreview: false,
          },
        ],
      },
      {
        title: 'Module 3',
        orderIndex: 3,
        lessons: [
          {
            title: '13. Tự học UIUX - Smart Animate trong Figma - Cách học figma nhanh nhất bzyciq',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842650/13._T%E1%BB%B1_h%E1%BB%8Dc_UIUX_-_Smart_Animate_trong_Figma_-_C%C3%A1ch_h%E1%BB%8Dc_figma_nhanh_nh%E1%BA%A5t_bzyciq.mp4',
            durationSeconds: 600,
            orderIndex: 1,
            isPreview: false,
          },
          {
            title: '12. Tạo bàn cờ caro bằng interactive component trong Figma gtgnws',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842648/12._T%E1%BA%A1o_b%C3%A0n_c%E1%BB%9D_caro_b%E1%BA%B1ng_interactive_component_trong_Figma_gtgnws.mp4',
            durationSeconds: 600,
            orderIndex: 2,
            isPreview: false,
          },
          {
            title: '15. Cách tách xóa hình nền trong Figma 2025 a94t5j',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842645/15._C%C3%A1ch_t%C3%A1ch_x%C3%B3a_h%C3%ACnh_n%E1%BB%81n_trong_Figma_2025_a94t5j.mp4',
            durationSeconds: 600,
            orderIndex: 3,
            isPreview: false,
          },
        ],
      },
    ],
  },

  {
    title: 'C++ Programming Fundamentals',
    slug: 'cpp-programming-fundamentals',
    description: `Học lập trình C++ từ cơ bản.
    
    Bạn sẽ học:
    - Compiler và Linker
    - IDE và môi trường phát triển
    - Cú pháp cơ bản C++
    - Debugging và testing
    - C++ Standard versions`,
    categorySlug: 'programming-languages',
    tags: ["cpp","c++","programming"],
    estimatedDurationMinutes: 600,
    thumbnailUrl: 'https://res.cloudinary.com/demo/image/upload/v1/courses/cpp-programming-fundamentals-thumb.jpg',
    status: 'published',
    modules: [
      {
        title: 'Module 1',
        orderIndex: 1,
        lessons: [
          {
            title: '16 C - Bài 1 - Ma may Hop ngu Ngon ngu lap trinh bac cao - YouTube fluzwz',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775843870/16_C_-_B%C3%A0i_1_-_Ma_may_Hop_ngu_Ngon_ngu_lap_trinh_bac_cao_-_YouTube_fluzwz.mp4',
            durationSeconds: 600,
            orderIndex: 1,
            isPreview: true,
          },
          {
            title: '16 C - Bài 3 - Giới thiệu về ngôn ngữ lập trình C-C - YouTube b2vdw5',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775843867/16_C_-_B%C3%A0i_3_-_Gi%E1%BB%9Bi_thi%E1%BB%87u_v%E1%BB%81_ng%C3%B4n_ng%E1%BB%AF_l%E1%BA%ADp_tr%C3%ACnh_C-C_-_YouTube_b2vdw5.mp4',
            durationSeconds: 600,
            orderIndex: 2,
            isPreview: false,
          },
          {
            title: '16 C - Bài 4 - Cách giải quyết vấn đề sử dụng C - YouTube lxhyiw',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775843865/16_C_-_B%C3%A0i_4_-_C%C3%A1ch_gi%E1%BA%A3i_quy%E1%BA%BFt_v%E1%BA%A5n_%C4%91%E1%BB%81_s%E1%BB%AD_d%E1%BB%A5ng_C_-_YouTube_lxhyiw.mp4',
            durationSeconds: 600,
            orderIndex: 3,
            isPreview: false,
          },
          {
            title: '16 C - Bài 2 - Giải thích dễ hiểu về Compiler Interpreter và ưu nhược điểm của chúng - YouTube zqwwr',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775843862/16_C_-_B%C3%A0i_2_-_Gi%E1%BA%A3i_th%C3%ADch_d%E1%BB%85_hi%E1%BB%83u_v%E1%BB%81_Compiler_Interpreter_v%C3%A0_%C6%B0u_nh%C6%B0%E1%BB%A3c_%C4%91i%E1%BB%83m_c%E1%BB%A7a_ch%C3%BAng_-_YouTube_zqwwro.mp4',
            durationSeconds: 600,
            orderIndex: 4,
            isPreview: false,
          },
          {
            title: '16 C - Bài 7 - Project Workspace Giải thích chi tiết các chức năng quan trọng - YouTube thvrnw',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775843860/16_C_-_B%C3%A0i_7_-_Project_Workspace_Gi%E1%BA%A3i_th%C3%ADch_chi_ti%E1%BA%BFt_c%C3%A1c_ch%E1%BB%A9c_n%C4%83ng_quan_tr%E1%BB%8Dng_-_YouTube_thvrnw.mp4',
            durationSeconds: 600,
            orderIndex: 5,
            isPreview: false,
          },
        ],
      },
      {
        title: 'Module 2',
        orderIndex: 2,
        lessons: [
          {
            title: '16 C - Bài 5 - Compiler Linker Libraries - YouTube n2neas',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775843860/16_C_-_B%C3%A0i_5_-_Compiler_Linker_Libraries_-_YouTube_n2neas.mp4',
            durationSeconds: 600,
            orderIndex: 1,
            isPreview: false,
          },
          {
            title: '16 C - Bài 6 - Một số IDE phổ biến để code C - YouTube tautbn',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775843859/16_C_-_B%C3%A0i_6_-_M%E1%BB%99t_s%E1%BB%91_IDE_ph%E1%BB%95_bi%E1%BA%BFn_%C4%91%E1%BB%83_code_C_-_YouTube_tautbn.mp4',
            durationSeconds: 600,
            orderIndex: 2,
            isPreview: false,
          },
          {
            title: '16 C - Bài 8 - Nên dùng cấu hình Debug hay Release- Ý nghĩa của thư mục bin và obj - YouTube cz7234',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775843855/16_C_-_B%C3%A0i_8_-_N%C3%AAn_d%C3%B9ng_c%E1%BA%A5u_h%C3%ACnh_Debug_hay_Release-_%C3%9D_ngh%C4%A9a_c%E1%BB%A7a_th%C6%B0_m%E1%BB%A5c_bin_v%C3%A0_obj_-_YouTube_cz7234.mp4',
            durationSeconds: 600,
            orderIndex: 3,
            isPreview: false,
          },
          {
            title: '16 C - Bài 9 - Vô hiệu hóa Compiler extensions - YouTube gn2f2h',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775843854/16_C_-_B%C3%A0i_9_-_V%C3%B4_hi%E1%BB%87u_h%C3%B3a_Compiler_extensions_-_YouTube_gn2f2h.mp4',
            durationSeconds: 600,
            orderIndex: 4,
            isPreview: false,
          },
          {
            title: '16 C - Bài 10 - Cấu hình Warning level và Error level - YouTube q6gmvr',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775843852/16_C_-_B%C3%A0i_10_-_C%E1%BA%A5u_h%C3%ACnh_Warning_level_v%C3%A0_Error_level_-_YouTube_q6gmvr.mp4',
            durationSeconds: 600,
            orderIndex: 5,
            isPreview: false,
          },
        ],
      },
      {
        title: 'Module 3',
        orderIndex: 3,
        lessons: [
          {
            title: '16 C - Bài 11 - Chọn phiên bản C standard phù hợp - YouTube ag5rph',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775843851/16_C_-_B%C3%A0i_11_-_Ch%E1%BB%8Dn_phi%C3%AAn_b%E1%BA%A3n_C_standard_ph%C3%B9_h%E1%BB%A3p_-_YouTube_ag5rph.mp4',
            durationSeconds: 600,
            orderIndex: 1,
            isPreview: false,
          },
          {
            title: '16 C - Bài 12 - Document chính thức của các phiên bản C standard - YouTube qhofwy',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775843849/16_C_-_B%C3%A0i_12_-_Document_ch%C3%ADnh_th%E1%BB%A9c_c%E1%BB%A7a_c%C3%A1c_phi%C3%AAn_b%E1%BA%A3n_C_standard_-_YouTube_qhofwy.mp4',
            durationSeconds: 600,
            orderIndex: 2,
            isPreview: false,
          },
          {
            title: '16 C - Bài 14 - Cấu trúc của một chương trình - YouTube kvlsxz',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775843846/16_C_-_B%C3%A0i_14_-_C%E1%BA%A5u_tr%C3%BAc_c%E1%BB%A7a_m%E1%BB%99t_ch%C6%B0%C6%A1ng_tr%C3%ACnh_-_YouTube_kvlsxz.mp4',
            durationSeconds: 600,
            orderIndex: 3,
            isPreview: false,
          },
          {
            title: '16 C - Bài 15 - Syntax và Syntax error - YouTube cvewdj',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775843844/16_C_-_B%C3%A0i_15_-_Syntax_v%C3%A0_Syntax_error_-_YouTube_cvewdj.mp4',
            durationSeconds: 600,
            orderIndex: 4,
            isPreview: false,
          },
          {
            title: '16 C - Bài 13 - Statements là gì- - YouTube rbvabo',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775843843/16_C_-_B%C3%A0i_13_-_Statements_l%C3%A0_g%C3%AC-_-_YouTube_rbvabo.mp4',
            durationSeconds: 600,
            orderIndex: 5,
            isPreview: false,
          },
        ],
      },
    ],
  },

  {
    title: 'DevOps on AWS - Complete Guide',
    slug: 'devops-aws-complete-guide',
    description: `Khóa học DevOps trên AWS cho người mới bắt đầu.
    
    Nội dung:
    - Giới thiệu DevOps và AWS
    - EC2, VPC, RDS
    - Jenkins CI/CD
    - Docker và containerization
    - Security best practices
    - Cost management`,
    categorySlug: 'devops',
    tags: ["aws","devops","cloud","jenkins"],
    estimatedDurationMinutes: 900,
    thumbnailUrl: 'https://res.cloudinary.com/demo/image/upload/v1/courses/devops-aws-complete-guide-thumb.jpg',
    status: 'published',
    modules: [
      {
        title: 'Module 1',
        orderIndex: 1,
        lessons: [
          {
            title: 'Bài 1. Giới thiệu về DevOps On AWS   Khóa học DevOps on AWS cho người mới bắt đầu - 720p 1 vh74uy',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775843817/B%C3%A0i_1._Gi%E1%BB%9Bi_thi%E1%BB%87u_v%E1%BB%81_DevOps_On_AWS___Kh%C3%B3a_h%E1%BB%8Dc_DevOps_on_AWS_cho_ng%C6%B0%E1%BB%9Di_m%E1%BB%9Bi_b%E1%BA%AFt_%C4%91%E1%BA%A7u_-_720p_1_vh74uy.mp4',
            durationSeconds: 600,
            orderIndex: 1,
            isPreview: true,
          },
          {
            title: 'Bài 2. DevOps Roadmap sơ lược   Khóa học DevOps on AWS cho người mới bắt đầu - 720p v1qfec',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775843816/B%C3%A0i_2._DevOps_Roadmap_s%C6%A1_l%C6%B0%E1%BB%A3c___Kh%C3%B3a_h%E1%BB%8Dc_DevOps_on_AWS_cho_ng%C6%B0%E1%BB%9Di_m%E1%BB%9Bi_b%E1%BA%AFt_%C4%91%E1%BA%A7u_-_720p_v1qfec.mp4',
            durationSeconds: 600,
            orderIndex: 2,
            isPreview: false,
          },
          {
            title: 'Bài 3. Các nguồn tài liệu DevOps   Khóa học DevOps on AWS cho người mới bắt đầu - 720p uyrr2k',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775843814/B%C3%A0i_3._C%C3%A1c_ngu%E1%BB%93n_t%C3%A0i_li%E1%BB%87u_DevOps___Kh%C3%B3a_h%E1%BB%8Dc_DevOps_on_AWS_cho_ng%C6%B0%E1%BB%9Di_m%E1%BB%9Bi_b%E1%BA%AFt_%C4%91%E1%BA%A7u_-_720p_uyrr2k.mp4',
            durationSeconds: 600,
            orderIndex: 3,
            isPreview: false,
          },
          {
            title: 'Bài 4. Vấn đề bảo mật và cẩn trọng trong DevOps   Khóa học DevOps on AWS cho người mới bắt đầu - 720',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775843811/B%C3%A0i_4._V%E1%BA%A5n_%C4%91%E1%BB%81_b%E1%BA%A3o_m%E1%BA%ADt_v%C3%A0_c%E1%BA%A9n_tr%E1%BB%8Dng_trong_DevOps___Kh%C3%B3a_h%E1%BB%8Dc_DevOps_on_AWS_cho_ng%C6%B0%E1%BB%9Di_m%E1%BB%9Bi_b%E1%BA%AFt_%C4%91%E1%BA%A7u_-_720p_mzobd6.mp4',
            durationSeconds: 600,
            orderIndex: 4,
            isPreview: false,
          },
          {
            title: 'Bài 5. Credit cho việc thực hành Cloud AWS   Khóa học DevOps on AWS cho người mới bắt đầu - 720p uwf',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775843809/B%C3%A0i_5._Credit_cho_vi%E1%BB%87c_th%E1%BB%B1c_h%C3%A0nh_Cloud_AWS___Kh%C3%B3a_h%E1%BB%8Dc_DevOps_on_AWS_cho_ng%C6%B0%E1%BB%9Di_m%E1%BB%9Bi_b%E1%BA%AFt_%C4%91%E1%BA%A7u_-_720p_uwfpmz.mp4',
            durationSeconds: 600,
            orderIndex: 5,
            isPreview: false,
          },
        ],
      },
      {
        title: 'Module 2',
        orderIndex: 2,
        lessons: [
          {
            title: 'Bài 6. Tạo IAM User Admin và sử dụng bảo mật 2 lớp   Khóa học DevOps on AWS cho người mới bắt đầu - ',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775843808/B%C3%A0i_6._T%E1%BA%A1o_IAM_User_Admin_v%C3%A0_s%E1%BB%AD_d%E1%BB%A5ng_b%E1%BA%A3o_m%E1%BA%ADt_2_l%E1%BB%9Bp___Kh%C3%B3a_h%E1%BB%8Dc_DevOps_on_AWS_cho_ng%C6%B0%E1%BB%9Di_m%E1%BB%9Bi_b%E1%BA%AFt_%C4%91%E1%BA%A7u_-_720p_ewff7r.mp4',
            durationSeconds: 600,
            orderIndex: 1,
            isPreview: false,
          },
          {
            title: 'Bài 7. Quản lý chi phí với AWS Budgets   Khóa học DevOps on AWS cho người mới bắt đầu - 720p dah40o',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775843806/B%C3%A0i_7._Qu%E1%BA%A3n_l%C3%BD_chi_ph%C3%AD_v%E1%BB%9Bi_AWS_Budgets___Kh%C3%B3a_h%E1%BB%8Dc_DevOps_on_AWS_cho_ng%C6%B0%E1%BB%9Di_m%E1%BB%9Bi_b%E1%BA%AFt_%C4%91%E1%BA%A7u_-_720p_dah40o.mp4',
            durationSeconds: 600,
            orderIndex: 2,
            isPreview: false,
          },
          {
            title: 'Bài 8. Tổng quan các loại dịch vụ trên AWS   Khóa học DevOps on AWS cho người mới bắt đầu - 720p mef',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775843804/B%C3%A0i_8._T%E1%BB%95ng_quan_c%C3%A1c_lo%E1%BA%A1i_d%E1%BB%8Bch_v%E1%BB%A5_tr%C3%AAn_AWS___Kh%C3%B3a_h%E1%BB%8Dc_DevOps_on_AWS_cho_ng%C6%B0%E1%BB%9Di_m%E1%BB%9Bi_b%E1%BA%AFt_%C4%91%E1%BA%A7u_-_720p_mef2ni.mp4',
            durationSeconds: 600,
            orderIndex: 3,
            isPreview: false,
          },
          {
            title: 'Bài 9. Khởi tạo và cài đặt EC2 Ubuntu với VPC default   Khóa học DevOps on AWS cho người mới bắt đầu',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775843792/B%C3%A0i_9._Kh%E1%BB%9Fi_t%E1%BA%A1o_v%C3%A0_c%C3%A0i_%C4%91%E1%BA%B7t_EC2_Ubuntu_v%E1%BB%9Bi_VPC_default___Kh%C3%B3a_h%E1%BB%8Dc_DevOps_on_AWS_cho_ng%C6%B0%E1%BB%9Di_m%E1%BB%9Bi_b%E1%BA%AFt_%C4%91%E1%BA%A7u_-_720p_alsxqa.mp4',
            durationSeconds: 600,
            orderIndex: 4,
            isPreview: false,
          },
          {
            title: 'Bài 10. Triển khai ứng dụng trên EC2 Ubuntu   Khóa học DevOps on AWS cho người mới bắt đầu - 720p nw',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775843761/B%C3%A0i_10._Tri%E1%BB%83n_khai_%E1%BB%A9ng_d%E1%BB%A5ng_tr%C3%AAn_EC2_Ubuntu___Kh%C3%B3a_h%E1%BB%8Dc_DevOps_on_AWS_cho_ng%C6%B0%E1%BB%9Di_m%E1%BB%9Bi_b%E1%BA%AFt_%C4%91%E1%BA%A7u_-_720p_nw6wap.mp4',
            durationSeconds: 600,
            orderIndex: 5,
            isPreview: false,
          },
        ],
      },
      {
        title: 'Module 3',
        orderIndex: 3,
        lessons: [
          {
            title: 'Bài 11. Cài đặt công cụ Jenkins trên EC2 Ubuntu   Khóa học DevOps on AWS cho người mới bắt đầu - 720',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775843758/B%C3%A0i_11._C%C3%A0i_%C4%91%E1%BA%B7t_c%C3%B4ng_c%E1%BB%A5_Jenkins_tr%C3%AAn_EC2_Ubuntu___Kh%C3%B3a_h%E1%BB%8Dc_DevOps_on_AWS_cho_ng%C6%B0%E1%BB%9Di_m%E1%BB%9Bi_b%E1%BA%AFt_%C4%91%E1%BA%A7u_-_720p_axndgr.mp4',
            durationSeconds: 600,
            orderIndex: 1,
            isPreview: false,
          },
          {
            title: 'Bài 12. Triển khai một VPC mới   Khóa học DevOps on AWS cho người mới bắt đầu - 720p xeeuoi',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775843756/B%C3%A0i_12._Tri%E1%BB%83n_khai_m%E1%BB%99t_VPC_m%E1%BB%9Bi___Kh%C3%B3a_h%E1%BB%8Dc_DevOps_on_AWS_cho_ng%C6%B0%E1%BB%9Di_m%E1%BB%9Bi_b%E1%BA%AFt_%C4%91%E1%BA%A7u_-_720p_xeeuoi.mp4',
            durationSeconds: 600,
            orderIndex: 2,
            isPreview: false,
          },
          {
            title: 'Bài 14. Cài đặt databases trên EC2 Ubuntu   Khóa học DevOps on AWS cho người mới bắt đầu - 720p qnms',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775843755/B%C3%A0i_14._C%C3%A0i_%C4%91%E1%BA%B7t_databases_tr%C3%AAn_EC2_Ubuntu___Kh%C3%B3a_h%E1%BB%8Dc_DevOps_on_AWS_cho_ng%C6%B0%E1%BB%9Di_m%E1%BB%9Bi_b%E1%BA%AFt_%C4%91%E1%BA%A7u_-_720p_qnmsvg.mp4',
            durationSeconds: 600,
            orderIndex: 3,
            isPreview: false,
          },
          {
            title: 'Bài 13. Khởi tạo EC2 với VPC mới và deploy ứng dụng   Khóa học DevOps on AWS cho người mới bắt đầu -',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775843755/B%C3%A0i_13._Kh%E1%BB%9Fi_t%E1%BA%A1o_EC2_v%E1%BB%9Bi_VPC_m%E1%BB%9Bi_v%C3%A0_deploy_%E1%BB%A9ng_d%E1%BB%A5ng___Kh%C3%B3a_h%E1%BB%8Dc_DevOps_on_AWS_cho_ng%C6%B0%E1%BB%9Di_m%E1%BB%9Bi_b%E1%BA%AFt_%C4%91%E1%BA%A7u_-_720p_bn4z2f.mp4',
            durationSeconds: 600,
            orderIndex: 4,
            isPreview: false,
          },
          {
            title: 'Bài 15. Tạo database RDS trên AWS   Khóa học DevOps on AWS cho người mới bắt đầu - 720p m9eofc',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775843753/B%C3%A0i_15._Ta%CC%A3o_database_RDS_tre%CC%82n_AWS___Kh%C3%B3a_h%E1%BB%8Dc_DevOps_on_AWS_cho_ng%C6%B0%E1%BB%9Di_m%E1%BB%9Bi_b%E1%BA%AFt_%C4%91%E1%BA%A7u_-_720p_m9eofc.mp4',
            durationSeconds: 600,
            orderIndex: 5,
            isPreview: false,
          },
        ],
      },
    ],
  },

  {
    title: 'PHP & MySQL Web Development',
    slug: 'php-mysql-web-development',
    description: `Lập trình web với PHP và MySQL.
    
    Nội dung:
    - PHP basics và syntax
    - Variables và data types
    - Operators và control structures
    - MySQL database integration
    - CRUD operations`,
    categorySlug: 'backend-development',
    tags: ["php","mysql","web-development"],
    estimatedDurationMinutes: 540,
    thumbnailUrl: 'https://res.cloudinary.com/demo/image/upload/v1/courses/php-mysql-web-development-thumb.jpg',
    status: 'published',
    modules: [
      {
        title: 'Module 1',
        orderIndex: 1,
        lessons: [
          {
            title: '4.1 Khoá học lập trình PHP MYSQL- Hướng dẫn dùng Laragon thay Xampp - YouTube n1jha4',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842624/4.1_Kho%C3%A1_h%E1%BB%8Dc_l%E1%BA%ADp_tr%C3%ACnh_PHP_MYSQL-_H%C6%B0%E1%BB%9Bng_d%E1%BA%ABn_d%C3%B9ng_Laragon_thay_Xampp_-_YouTube_n1jha4.mp4',
            durationSeconds: 600,
            orderIndex: 1,
            isPreview: true,
          },
          {
            title: '1. Khoá học lập trình PHP MYSQL - Bài 1- Bạn sẽ học được những gì ở khóa học này- - YouTube mrlwst',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842624/1._Kho%C3%A1_h%E1%BB%8Dc_l%E1%BA%ADp_tr%C3%ACnh_PHP_MYSQL_-_B%C3%A0i_1-_B%E1%BA%A1n_s%E1%BA%BD_h%E1%BB%8Dc_%C4%91%C6%B0%E1%BB%A3c_nh%E1%BB%AFng_g%C3%AC_%E1%BB%9F_kh%C3%B3a_h%E1%BB%8Dc_n%C3%A0y-_-_YouTube_mrlwst.mp4',
            durationSeconds: 600,
            orderIndex: 2,
            isPreview: false,
          },
          {
            title: '3. Khoá học lập trình PHP MYSQL - Bài 3- Cài đặt công cụ và môi trường phát triển. VS Code Xampp - Y',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842623/3._Kho%C3%A1_h%E1%BB%8Dc_l%E1%BA%ADp_tr%C3%ACnh_PHP_MYSQL_-_B%C3%A0i_3-_C%C3%A0i_%C4%91%E1%BA%B7t_c%C3%B4ng_c%E1%BB%A5_v%C3%A0_m%C3%B4i_tr%C6%B0%E1%BB%9Dng_ph%C3%A1t_tri%E1%BB%83n._VS_Code_Xampp_-_YouTube_ldflfr.mp4',
            durationSeconds: 600,
            orderIndex: 3,
            isPreview: false,
          },
          {
            title: '2. Khoá học lập trình PHP MYSQL - Bài 2- Tổng quan về lập trình PHP - YouTube yvqksr',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842623/2._Kho%C3%A1_h%E1%BB%8Dc_l%E1%BA%ADp_tr%C3%ACnh_PHP_MYSQL_-_B%C3%A0i_2-_T%E1%BB%95ng_quan_v%E1%BB%81_l%E1%BA%ADp_tr%C3%ACnh_PHP_-_YouTube_yvqksr.mp4',
            durationSeconds: 600,
            orderIndex: 4,
            isPreview: false,
          },
          {
            title: '5. Khoá học lập trình PHP MYSQL - Bài 5- Cú pháp cơ bản trong PHP - YouTube e6q5v8',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842621/5._Kho%C3%A1_h%E1%BB%8Dc_l%E1%BA%ADp_tr%C3%ACnh_PHP_MYSQL_-_B%C3%A0i_5-_C%C3%BA_ph%C3%A1p_c%C6%A1_b%E1%BA%A3n_trong_PHP_-_YouTube_e6q5v8.mp4',
            durationSeconds: 600,
            orderIndex: 5,
            isPreview: false,
          },
        ],
      },
      {
        title: 'Module 2',
        orderIndex: 2,
        lessons: [
          {
            title: '4. Khoá học lập trình PHP MYSQL - Bài 4- Thêm project vào Xampp và VSCode Visual Studio Code - YouTu',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842622/4._Kho%C3%A1_h%E1%BB%8Dc_l%E1%BA%ADp_tr%C3%ACnh_PHP_MYSQL_-_B%C3%A0i_4-_Th%C3%AAm_project_v%C3%A0o_Xampp_v%C3%A0_VSCode_Visual_Studio_Code_-_YouTube_rnpmdo.mp4',
            durationSeconds: 600,
            orderIndex: 1,
            isPreview: false,
          },
          {
            title: '8. Khoá học lập trình PHP MYSQL - Bài 8- Hằng số trong PHP - YouTube jippu9',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842620/8._Kho%C3%A1_h%E1%BB%8Dc_l%E1%BA%ADp_tr%C3%ACnh_PHP_MYSQL_-_B%C3%A0i_8-_H%E1%BA%B1ng_s%E1%BB%91_trong_PHP_-_YouTube_jippu9.mp4',
            durationSeconds: 600,
            orderIndex: 2,
            isPreview: false,
          },
          {
            title: '7. Khoá học lập trình PHP MYSQL - Bài 7- Biến variable PHP - YouTube dukg71',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842619/7._Kho%C3%A1_h%E1%BB%8Dc_l%E1%BA%ADp_tr%C3%ACnh_PHP_MYSQL_-_B%C3%A0i_7-_Bi%E1%BA%BFn_variable_PHP_-_YouTube_dukg71.mp4',
            durationSeconds: 600,
            orderIndex: 3,
            isPreview: false,
          },
          {
            title: '6. Khoá học lập trình PHP MYSQL - Bài 6- Lưu ý khi viết code PHP - YouTube dibokd',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842620/6._Kho%C3%A1_h%E1%BB%8Dc_l%E1%BA%ADp_tr%C3%ACnh_PHP_MYSQL_-_B%C3%A0i_6-_L%C6%B0u_%C3%BD_khi_vi%E1%BA%BFt_code_PHP_-_YouTube_dibokd.mp4',
            durationSeconds: 600,
            orderIndex: 4,
            isPreview: false,
          },
          {
            title: '9. Khoá học lập trình PHP MYSQL - Bài 9- Kiểu dữ liệu trong PHP - Phần 1 - YouTube uhlnmc',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842619/9._Kho%C3%A1_h%E1%BB%8Dc_l%E1%BA%ADp_tr%C3%ACnh_PHP_MYSQL_-_B%C3%A0i_9-_Ki%E1%BB%83u_d%E1%BB%AF_li%E1%BB%87u_trong_PHP_-_Ph%E1%BA%A7n_1_-_YouTube_uhlnmc.mp4',
            durationSeconds: 600,
            orderIndex: 5,
            isPreview: false,
          },
        ],
      },
      {
        title: 'Module 3',
        orderIndex: 3,
        lessons: [
          {
            title: '11.1 Khoá học lập trình PHP MYSQL - Bài 11- Các loại Toán tử PHP - Phần 1 - YouTube cp8nh7',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842618/11.1_Kho%C3%A1_h%E1%BB%8Dc_l%E1%BA%ADp_tr%C3%ACnh_PHP_MYSQL_-_B%C3%A0i_11-_C%C3%A1c_lo%E1%BA%A1i_To%C3%A1n_t%E1%BB%AD_PHP_-_Ph%E1%BA%A7n_1_-_YouTube_cp8nh7.mp4',
            durationSeconds: 600,
            orderIndex: 1,
            isPreview: false,
          },
          {
            title: '13. Khoá học lập trình PHP MYSQL - Bài 13- Các loại Toán tử PHP - Phần 3 - YouTube kfitwg',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842617/13._Kho%C3%A1_h%E1%BB%8Dc_l%E1%BA%ADp_tr%C3%ACnh_PHP_MYSQL_-_B%C3%A0i_13-_C%C3%A1c_lo%E1%BA%A1i_To%C3%A1n_t%E1%BB%AD_PHP_-_Ph%E1%BA%A7n_3_-_YouTube_kfitwg.mp4',
            durationSeconds: 600,
            orderIndex: 2,
            isPreview: false,
          },
          {
            title: '10. Khoá học lập trình PHP MYSQL - Bài 10- Kiểu dữ liệu trong PHP - Phần 2 - YouTube frborq',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842617/10._Kho%C3%A1_h%E1%BB%8Dc_l%E1%BA%ADp_tr%C3%ACnh_PHP_MYSQL_-_B%C3%A0i_10-_Ki%E1%BB%83u_d%E1%BB%AF_li%E1%BB%87u_trong_PHP_-_Ph%E1%BA%A7n_2_-_YouTube_frborq.mp4',
            durationSeconds: 600,
            orderIndex: 3,
            isPreview: false,
          },
          {
            title: '12. Khoá học lập trình PHP MYSQL - Bài 12- Các loại Toán tử PHP - Phần 2 - YouTube hzebl4',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842617/12._Kho%C3%A1_h%E1%BB%8Dc_l%E1%BA%ADp_tr%C3%ACnh_PHP_MYSQL_-_B%C3%A0i_12-_C%C3%A1c_lo%E1%BA%A1i_To%C3%A1n_t%E1%BB%AD_PHP_-_Ph%E1%BA%A7n_2_-_YouTube_hzebl4.mp4',
            durationSeconds: 600,
            orderIndex: 4,
            isPreview: false,
          },
          {
            title: '14. Khoá học lập trình PHP MYSQL - Bài 14- Câu lệnh điều kiện if-else - YouTube rjele5',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842616/14._Kho%C3%A1_h%E1%BB%8Dc_l%E1%BA%ADp_tr%C3%ACnh_PHP_MYSQL_-_B%C3%A0i_14-_C%C3%A2u_l%E1%BB%87nh_%C4%91i%E1%BB%81u_ki%E1%BB%87n_if-else_-_YouTube_rjele5.mp4',
            durationSeconds: 600,
            orderIndex: 5,
            isPreview: false,
          },
        ],
      },
      {
        title: 'Module 4',
        orderIndex: 4,
        lessons: [
          {
            title: '15. Khoá học lập trình PHP MYSQL - Bài 15- Toán tử 3 ngôi và câu điều kiện if lồng nhau - YouTube px',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842615/15._Kho%C3%A1_h%E1%BB%8Dc_l%E1%BA%ADp_tr%C3%ACnh_PHP_MYSQL_-_B%C3%A0i_15-_To%C3%A1n_t%E1%BB%AD_3_ng%C3%B4i_v%C3%A0_c%C3%A2u_%C4%91i%E1%BB%81u_ki%E1%BB%87n_if_l%E1%BB%93ng_nhau_-_YouTube_pxvplh.mp4',
            durationSeconds: 600,
            orderIndex: 1,
            isPreview: false,
          },
        ],
      },
    ],
  },

  {
    title: 'Next.js 15 & TypeScript - Modern Web Development',
    slug: 'nextjs-typescript-modern-web',
    description: `Xây dựng ứng dụng web hiện đại với Next.js 15 và TypeScript.
    
    Bạn sẽ học:
    - Next.js App Router
    - Server Components
    - TypeScript integration
    - Data fetching strategies
    - Form handling với Shadcn
    - Deployment`,
    categorySlug: 'frontend-development',
    tags: ["nextjs","typescript","react","frontend"],
    estimatedDurationMinutes: 840,
    thumbnailUrl: 'https://res.cloudinary.com/demo/image/upload/v1/courses/nextjs-typescript-modern-web-thumb.jpg',
    status: 'published',
    modules: [
      {
        title: 'Module 1',
        orderIndex: 1,
        lessons: [
          {
            title: 'PRE-ORDER Ra mắt khóa học NextJS 15 TypeScript ycslc7',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842605/PRE-ORDER_Ra_m%E1%BA%AFt_kh%C3%B3a_h%E1%BB%8Dc_NextJS_15_TypeScript_ycslc7.mp4',
            durationSeconds: 600,
            orderIndex: 1,
            isPreview: true,
          },
          {
            title: 'Khóa học NextJS 2024 - Kiến thức cần chuẩn bị trước khi học NextJS qhmwu5',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842602/Kh%C3%B3a_h%E1%BB%8Dc_NextJS_2024_-_Ki%E1%BA%BFn_th%E1%BB%A9c_c%E1%BA%A7n_chu%E1%BA%A9n_b%E1%BB%8B_tr%C6%B0%E1%BB%9Bc_khi_h%E1%BB%8Dc_NextJS_qhmwu5.mp4',
            durationSeconds: 600,
            orderIndex: 2,
            isPreview: false,
          },
          {
            title: 'Mindmap Lộ trình tự học NextJS dành cho người mới như thế nào. a7orke',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842603/Mindmap_L%E1%BB%99_tr%C3%ACnh_t%E1%BB%B1_h%E1%BB%8Dc_NextJS_d%C3%A0nh_cho_ng%C6%B0%E1%BB%9Di_m%E1%BB%9Bi_nh%C6%B0_th%E1%BA%BF_n%C3%A0o._a7orke.mp4',
            durationSeconds: 600,
            orderIndex: 3,
            isPreview: false,
          },
          {
            title: 'Khóa học NextJS 2024 - Cài đặt NextJS và cấu hình Visual Studio Code tzektx',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842602/Kh%C3%B3a_h%E1%BB%8Dc_NextJS_2024_-_C%C3%A0i_%C4%91%E1%BA%B7t_NextJS_v%C3%A0_c%E1%BA%A5u_h%C3%ACnh_Visual_Studio_Code_tzektx.mp4',
            durationSeconds: 600,
            orderIndex: 4,
            isPreview: false,
          },
          {
            title: 'Khóa học NextJS 2024 - Giới thiệu NextJS Framework hryd1x',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842603/Kh%C3%B3a_h%E1%BB%8Dc_NextJS_2024_-_Gi%E1%BB%9Bi_thi%E1%BB%87u_NextJS_Framework_hryd1x.mp4',
            durationSeconds: 600,
            orderIndex: 5,
            isPreview: false,
          },
        ],
      },
      {
        title: 'Module 2',
        orderIndex: 2,
        lessons: [
          {
            title: 'Khóa học NextJS 2024 - Không biết TypeScript có học được không. up0saj',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842602/Kh%C3%B3a_h%E1%BB%8Dc_NextJS_2024_-_Kh%C3%B4ng_bi%E1%BA%BFt_TypeScript_c%C3%B3_h%E1%BB%8Dc_%C4%91%C6%B0%E1%BB%A3c_kh%C3%B4ng._up0saj.mp4',
            durationSeconds: 600,
            orderIndex: 1,
            isPreview: false,
          },
          {
            title: 'Khóa học NextJS 2024 - Chuẩn bị công cụ và môi trường rpm3nv',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842602/Kh%C3%B3a_h%E1%BB%8Dc_NextJS_2024_-_Chu%E1%BA%A9n_b%E1%BB%8B_c%C3%B4ng_c%E1%BB%A5_v%C3%A0_m%C3%B4i_tr%C6%B0%E1%BB%9Dng_rpm3nv.mp4',
            durationSeconds: 600,
            orderIndex: 2,
            isPreview: false,
          },
          {
            title: 'Xây dựng Form chuyên nghiệp bằng Shadcn Form Builder trong NextJS tsx28z',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842598/X%C3%A2y_d%E1%BB%B1ng_Form_chuy%C3%AAn_nghi%E1%BB%87p_b%E1%BA%B1ng_Shadcn_Form_Builder_trong_NextJS_tsx28z.mp4',
            durationSeconds: 600,
            orderIndex: 3,
            isPreview: false,
          },
          {
            title: 'Khóa học NextJS 2024 - Page Layout - Cách tạo Page trong NextJS qmkh6l',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842598/Kh%C3%B3a_h%E1%BB%8Dc_NextJS_2024_-_Page_Layout_-_C%C3%A1ch_t%E1%BA%A1o_Page_trong_NextJS_qmkh6l.mp4',
            durationSeconds: 600,
            orderIndex: 4,
            isPreview: false,
          },
          {
            title: 'Khóa học NextJS 2024 - Phân biệt các cơ chế Rendering- CSR - SSR - SSG - ISR tcynln',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842598/Kh%C3%B3a_h%E1%BB%8Dc_NextJS_2024_-_Ph%C3%A2n_bi%E1%BB%87t_c%C3%A1c_c%C6%A1_ch%E1%BA%BF_Rendering-_CSR_-_SSR_-_SSG_-_ISR_tcynln.mp4',
            durationSeconds: 600,
            orderIndex: 5,
            isPreview: false,
          },
        ],
      },
      {
        title: 'Module 3',
        orderIndex: 3,
        lessons: [
          {
            title: 'Khóa học NextJS 2024 - Kỹ thuật chia Layout trong NextJS xbru5x',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842597/Kh%C3%B3a_h%E1%BB%8Dc_NextJS_2024_-_K%E1%BB%B9_thu%E1%BA%ADt_chia_Layout_trong_NextJS_xbru5x.mp4',
            durationSeconds: 600,
            orderIndex: 1,
            isPreview: false,
          },
          {
            title: 'Khóa học NextJS 2024 - Tìm hiểu cấu trúc dự án NextJS zmxxun',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842597/Kh%C3%B3a_h%E1%BB%8Dc_NextJS_2024_-_T%C3%ACm_hi%E1%BB%83u_c%E1%BA%A5u_tr%C3%BAc_d%E1%BB%B1_%C3%A1n_NextJS_zmxxun.mp4',
            durationSeconds: 600,
            orderIndex: 2,
            isPreview: false,
          },
          {
            title: 'Notion Clone - Tổng quan về dự án khóa NextJS và công nghệ sử dụng s32xkx',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842596/Notion_Clone_-_T%E1%BB%95ng_quan_v%E1%BB%81_d%E1%BB%B1_%C3%A1n_kh%C3%B3a_NextJS_v%C3%A0_c%C3%B4ng_ngh%E1%BB%87_s%E1%BB%AD_d%E1%BB%A5ng_s32xkx.mp4',
            durationSeconds: 600,
            orderIndex: 3,
            isPreview: false,
          },
        ],
      },
    ],
  },

  {
    title: 'Git & GitHub - Version Control Mastery',
    slug: 'git-github-version-control',
    description: `Làm chủ Git và GitHub cho team collaboration.
    
    Nội dung:
    - Git fundamentals
    - Branching và merging
    - Rebase và reset
    - GitHub workflow
    - Pull requests và code review
    - GitHub Desktop và VS Code integration`,
    categorySlug: 'tools',
    tags: ["git","github","version-control"],
    estimatedDurationMinutes: 960,
    thumbnailUrl: 'https://res.cloudinary.com/demo/image/upload/v1/courses/git-github-version-control-thumb.jpg',
    status: 'published',
    modules: [
      {
        title: 'Module 1',
        orderIndex: 1,
        lessons: [
          {
            title: 'Học Git và Github - Bài 03. Các câu lệnh cơ bản để quản lý file và thư mục osin1c',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842585/H%E1%BB%8Dc_Git_v%C3%A0_Github_-_B%C3%A0i_03._C%C3%A1c_c%C3%A2u_l%E1%BB%87nh_c%C6%A1_b%E1%BA%A3n_%C4%91%E1%BB%83_qu%E1%BA%A3n_l%C3%BD_file_v%C3%A0_th%C6%B0_m%E1%BB%A5c_osin1c.mp4',
            durationSeconds: 600,
            orderIndex: 1,
            isPreview: true,
          },
          {
            title: 'Học Git và Github - Bài 01. Giới thiệu về Git - hệ thống quản lý phiên bản mafjcj',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842582/H%E1%BB%8Dc_Git_v%C3%A0_Github_-_B%C3%A0i_01._Gi%E1%BB%9Bi_thi%E1%BB%87u_v%E1%BB%81_Git_-_h%E1%BB%87_th%E1%BB%91ng_qu%E1%BA%A3n_l%C3%BD_phi%C3%AAn_b%E1%BA%A3n_mafjcj.mp4',
            durationSeconds: 600,
            orderIndex: 2,
            isPreview: false,
          },
          {
            title: 'Học Git và Github - Bài 04. Cách tạo Repository mới trong Git xnaf7w',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842580/H%E1%BB%8Dc_Git_v%C3%A0_Github_-_B%C3%A0i_04._C%C3%A1ch_t%E1%BA%A1o_Repository_m%E1%BB%9Bi_trong_Git_xnaf7w.mp4',
            durationSeconds: 600,
            orderIndex: 3,
            isPreview: false,
          },
          {
            title: 'Học Git và Github - Bài 02. Hướng dẫn cách cài đặt Git trên máy cá nhân kj48mx',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842581/H%E1%BB%8Dc_Git_v%C3%A0_Github_-_B%C3%A0i_02._H%C6%B0%E1%BB%9Bng_d%E1%BA%ABn_c%C3%A1ch_c%C3%A0i_%C4%91%E1%BA%B7t_Git_tr%C3%AAn_m%C3%A1y_c%C3%A1_nh%C3%A2n_kj48mx.mp4',
            durationSeconds: 600,
            orderIndex: 4,
            isPreview: false,
          },
          {
            title: 'Học Git và Github - Bài 05. Cấu hình thông tin cho Repository osplnf',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842579/H%E1%BB%8Dc_Git_v%C3%A0_Github_-_B%C3%A0i_05._C%E1%BA%A5u_h%C3%ACnh_th%C3%B4ng_tin_cho_Repository_osplnf.mp4',
            durationSeconds: 600,
            orderIndex: 5,
            isPreview: false,
          },
        ],
      },
      {
        title: 'Module 2',
        orderIndex: 2,
        lessons: [
          {
            title: 'Học Git và Github - Bài 06. Thực hành GIT add - GIT commit - GIT status - GIT diff - GIT log b5ym1u',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842579/H%E1%BB%8Dc_Git_v%C3%A0_Github_-_B%C3%A0i_06._Th%E1%BB%B1c_h%C3%A0nh_GIT_add_-_GIT_commit_-_GIT_status_-_GIT_diff_-_GIT_log_b5ym1u.mp4',
            durationSeconds: 600,
            orderIndex: 1,
            isPreview: false,
          },
          {
            title: 'Học Git và Github - Bài 11. Branches - cách làm việc với nhiều nhánh trong Git ah6v6m',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842576/H%E1%BB%8Dc_Git_v%C3%A0_Github_-_B%C3%A0i_11._Branches_-_c%C3%A1ch_l%C3%A0m_vi%E1%BB%87c_v%E1%BB%9Bi_nhi%E1%BB%81u_nh%C3%A1nh_trong_Git_ah6v6m.mp4',
            durationSeconds: 600,
            orderIndex: 2,
            isPreview: false,
          },
          {
            title: 'Học Git và Github - Bài 10. Câu lệnh GIT CHECKOUT chuyển đổi giữa các commit trong Git q74txf',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842576/H%E1%BB%8Dc_Git_v%C3%A0_Github_-_B%C3%A0i_10._C%C3%A2u_l%E1%BB%87nh_GIT_CHECKOUT_chuy%E1%BB%83n_%C4%91%E1%BB%95i_gi%E1%BB%AFa_c%C3%A1c_commit_trong_Git_q74txf.mp4',
            durationSeconds: 600,
            orderIndex: 3,
            isPreview: false,
          },
          {
            title: 'Học Git và Github - Bài 07. Cấu hình GITIGNORE để bỏ qua các file không cần giám sát a9jg5x',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842576/H%E1%BB%8Dc_Git_v%C3%A0_Github_-_B%C3%A0i_07._C%E1%BA%A5u_h%C3%ACnh_GITIGNORE_%C4%91%E1%BB%83_b%E1%BB%8F_qua_c%C3%A1c_file_kh%C3%B4ng_c%E1%BA%A7n_gi%C3%A1m_s%C3%A1t_a9jg5x.mp4',
            durationSeconds: 600,
            orderIndex: 4,
            isPreview: false,
          },
          {
            title: 'Học Git và Github - Bài 09. Xử lý xung đột trong Git - Merge Conflict wf4u0q',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842575/H%E1%BB%8Dc_Git_v%C3%A0_Github_-_B%C3%A0i_09._X%E1%BB%AD_l%C3%BD_xung_%C4%91%E1%BB%99t_trong_Git_-_Merge_Conflict_wf4u0q.mp4',
            durationSeconds: 600,
            orderIndex: 5,
            isPreview: false,
          },
        ],
      },
      {
        title: 'Module 3',
        orderIndex: 3,
        lessons: [
          {
            title: 'Học Git và Github - Bài 13. Git Rebase - tái cơ sở cho một nhánh trong Git jlsv8c',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842572/H%E1%BB%8Dc_Git_v%C3%A0_Github_-_B%C3%A0i_13._Git_Rebase_-_t%C3%A1i_c%C6%A1_s%E1%BB%9F_cho_m%E1%BB%99t_nh%C3%A1nh_trong_Git_jlsv8c.mp4',
            durationSeconds: 600,
            orderIndex: 1,
            isPreview: false,
          },
          {
            title: 'Học Git và Github - Bài 12. Git Merge - Kết hợp nội dung từ các nhánh ftbwqy',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842572/H%E1%BB%8Dc_Git_v%C3%A0_Github_-_B%C3%A0i_12._Git_Merge_-_K%E1%BA%BFt_h%E1%BB%A3p_n%E1%BB%99i_dung_t%E1%BB%AB_c%C3%A1c_nh%C3%A1nh_ftbwqy.mp4',
            durationSeconds: 600,
            orderIndex: 2,
            isPreview: false,
          },
          {
            title: 'Học Git và Github - Bài 16. Git Revert - Quay lại các commit trước đây y7co53',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842570/H%E1%BB%8Dc_Git_v%C3%A0_Github_-_B%C3%A0i_16._Git_Revert_-_Quay_l%E1%BA%A1i_c%C3%A1c_commit_tr%C6%B0%E1%BB%9Bc_%C4%91%C3%A2y_y7co53.mp4',
            durationSeconds: 600,
            orderIndex: 3,
            isPreview: false,
          },
          {
            title: 'Học Git và Github - Bài 15. Git Reset - Hủy bỏ commit ycq7uj',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842570/H%E1%BB%8Dc_Git_v%C3%A0_Github_-_B%C3%A0i_15._Git_Reset_-_H%E1%BB%A7y_b%E1%BB%8F_commit_ycq7uj.mp4',
            durationSeconds: 600,
            orderIndex: 4,
            isPreview: false,
          },
          {
            title: 'Học Git và Github - Bài 14. Cách xóa nhánh trong GIT q4aqur',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842570/H%E1%BB%8Dc_Git_v%C3%A0_Github_-_B%C3%A0i_14._C%C3%A1ch_x%C3%B3a_nh%C3%A1nh_trong_GIT_q4aqur.mp4',
            durationSeconds: 600,
            orderIndex: 5,
            isPreview: false,
          },
        ],
      },
      {
        title: 'Module 4',
        orderIndex: 4,
        lessons: [
          {
            title: 'Học Git và Github - Bài 17. Tạo tài khoản mới trên GitHub nbkdef',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842568/H%E1%BB%8Dc_Git_v%C3%A0_Github_-_B%C3%A0i_17._T%E1%BA%A1o_t%C3%A0i_kho%E1%BA%A3n_m%E1%BB%9Bi_tr%C3%AAn_GitHub_nbkdef.mp4',
            durationSeconds: 600,
            orderIndex: 1,
            isPreview: false,
          },
          {
            title: 'Học Git và Github - Bài 18. Tạo Repository mới trong GitHub v2bwzn',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842567/H%E1%BB%8Dc_Git_v%C3%A0_Github_-_B%C3%A0i_18._T%E1%BA%A1o_Repository_m%E1%BB%9Bi_trong_GitHub_v2bwzn.mp4',
            durationSeconds: 600,
            orderIndex: 2,
            isPreview: false,
          },
          {
            title: 'Học Git và Github - Bài 21. Fork và cập nhật Repo của người khác trên GitHub bkbbon',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842564/H%E1%BB%8Dc_Git_v%C3%A0_Github_-_B%C3%A0i_21._Fork_v%C3%A0_c%E1%BA%ADp_nh%E1%BA%ADt_Repo_c%E1%BB%A7a_ng%C6%B0%E1%BB%9Di_kh%C3%A1c_tr%C3%AAn_GitHub_bkbbon.mp4',
            durationSeconds: 600,
            orderIndex: 3,
            isPreview: false,
          },
          {
            title: 'Học Git và Github - Bài 19. Cách clone dự án từ GitHub về máy zplvkq',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842564/H%E1%BB%8Dc_Git_v%C3%A0_Github_-_B%C3%A0i_19._C%C3%A1ch_clone_d%E1%BB%B1_%C3%A1n_t%E1%BB%AB_GitHub_v%E1%BB%81_m%C3%A1y_zplvkq.mp4',
            durationSeconds: 600,
            orderIndex: 4,
            isPreview: false,
          },
          {
            title: 'Học Git và Github - Bài 20. Đẩy dự án từ máy cá nhân lên GitHub jvbe6g',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842564/H%E1%BB%8Dc_Git_v%C3%A0_Github_-_B%C3%A0i_20._%C4%90%E1%BA%A9y_d%E1%BB%B1_%C3%A1n_t%E1%BB%AB_m%C3%A1y_c%C3%A1_nh%C3%A2n_l%C3%AAn_GitHub_jvbe6g.mp4',
            durationSeconds: 600,
            orderIndex: 5,
            isPreview: false,
          },
        ],
      },
      {
        title: 'Module 5',
        orderIndex: 5,
        lessons: [
          {
            title: 'Học Git và Github - Bài 22. Cách tạo Pull Request trong Github td3fun',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842564/H%E1%BB%8Dc_Git_v%C3%A0_Github_-_B%C3%A0i_22._C%C3%A1ch_t%E1%BA%A1o_Pull_Request_trong_Github_td3fun.mp4',
            durationSeconds: 600,
            orderIndex: 1,
            isPreview: false,
          },
          {
            title: 'Học Git và Github - Bài 23. Cài đặt và sử dụng GitHub Desktop eib0hv',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842564/H%E1%BB%8Dc_Git_v%C3%A0_Github_-_B%C3%A0i_23._C%C3%A0i_%C4%91%E1%BA%B7t_v%C3%A0_s%E1%BB%AD_d%E1%BB%A5ng_GitHub_Desktop_eib0hv.mp4',
            durationSeconds: 600,
            orderIndex: 2,
            isPreview: false,
          },
          {
            title: 'Học Git và Github - Bài 24. Sử dụng Git và GitHub trong Visual Studio Code cbtsvm',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842562/H%E1%BB%8Dc_Git_v%C3%A0_Github_-_B%C3%A0i_24._S%E1%BB%AD_d%E1%BB%A5ng_Git_v%C3%A0_GitHub_trong_Visual_Studio_Code_cbtsvm.mp4',
            durationSeconds: 600,
            orderIndex: 3,
            isPreview: false,
          },
        ],
      },
    ],
  },

  {
    title: 'Vue.js 3 - Progressive JavaScript Framework',
    slug: 'vuejs-progressive-framework',
    description: `Học Vue.js 3 từ cơ bản đến nâng cao.
    
    Bạn sẽ học:
    - Vue fundamentals
    - Composition API
    - Reactivity system
    - Components và props
    - Computed properties
    - Directives và binding`,
    categorySlug: 'frontend-development',
    tags: ["vuejs","vue","javascript","frontend"],
    estimatedDurationMinutes: 600,
    thumbnailUrl: 'https://res.cloudinary.com/demo/image/upload/v1/courses/vuejs-progressive-framework-thumb.jpg',
    status: 'published',
    modules: [
      {
        title: 'Module 1',
        orderIndex: 1,
        lessons: [
          {
            title: '2. Giới thiệu Vue myqoxy',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842526/2._Gi%E1%BB%9Bi_thi%E1%BB%87u_Vue_myqoxy.mp4',
            durationSeconds: 600,
            orderIndex: 1,
            isPreview: true,
          },
          {
            title: '1. Giới thiệu Vue geqizo',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842527/1._Gi%E1%BB%9Bi_thi%E1%BB%87u_Vue_geqizo.mp4',
            durationSeconds: 600,
            orderIndex: 2,
            isPreview: false,
          },
          {
            title: '6. Cú pháp cơ bản trong Vue - Binding là gì- - Khoá học Vuejs từ cơ bản đến nâng cao - YouTube flaoj',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842525/6._C%C3%BA_ph%C3%A1p_c%C6%A1_b%E1%BA%A3n_trong_Vue_-_Binding_l%C3%A0_g%C3%AC-_-_Kho%C3%A1_h%E1%BB%8Dc_Vuejs_t%E1%BB%AB_c%C6%A1_b%E1%BA%A3n_%C4%91%E1%BA%BFn_n%C3%A2ng_cao_-_YouTube_flaojt.mp4',
            durationSeconds: 600,
            orderIndex: 3,
            isPreview: false,
          },
          {
            title: '3. Single-File Components SFC là gì- - Khoá học Vuejs từ cơ bản đến nâng cao - YouTube ubt3c3',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842525/3._Single-File_Components_SFC_l%C3%A0_g%C3%AC-_-_Kho%C3%A1_h%E1%BB%8Dc_Vuejs_t%E1%BB%AB_c%C6%A1_b%E1%BA%A3n_%C4%91%E1%BA%BFn_n%C3%A2ng_cao_-_YouTube_ubt3c3.mp4',
            durationSeconds: 600,
            orderIndex: 4,
            isPreview: false,
          },
          {
            title: '4. API Styles trong Vue - Khoá học Vuejs từ cơ bản đến nâng cao - YouTube rkwjc4',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842525/4._API_Styles_trong_Vue_-_Kho%C3%A1_h%E1%BB%8Dc_Vuejs_t%E1%BB%AB_c%C6%A1_b%E1%BA%A3n_%C4%91%E1%BA%BFn_n%C3%A2ng_cao_-_YouTube_rkwjc4.mp4',
            durationSeconds: 600,
            orderIndex: 5,
            isPreview: false,
          },
        ],
      },
      {
        title: 'Module 2',
        orderIndex: 2,
        lessons: [
          {
            title: '5. Ứng dụng Vue đầu tiên - Khoá học Vuejs từ cơ bản đến nâng cao - YouTube x6z9gl',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842524/5._%E1%BB%A8ng_d%E1%BB%A5ng_Vue_%C4%91%E1%BA%A7u_ti%C3%AAn_-_Kho%C3%A1_h%E1%BB%8Dc_Vuejs_t%E1%BB%AB_c%C6%A1_b%E1%BA%A3n_%C4%91%E1%BA%BFn_n%C3%A2ng_cao_-_YouTube_x6z9gl.mp4',
            durationSeconds: 600,
            orderIndex: 1,
            isPreview: false,
          },
          {
            title: '7. Sử dụng biểu thức trong Binding - Khoá học Vuejs từ cơ bản đến nâng cao - YouTube zqb5au',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842524/7._S%E1%BB%AD_d%E1%BB%A5ng_bi%E1%BB%83u_th%E1%BB%A9c_trong_Binding_-_Kho%C3%A1_h%E1%BB%8Dc_Vuejs_t%E1%BB%AB_c%C6%A1_b%E1%BA%A3n_%C4%91%E1%BA%BFn_n%C3%A2ng_cao_-_YouTube_zqb5au.mp4',
            durationSeconds: 600,
            orderIndex: 2,
            isPreview: false,
          },
          {
            title: '9. Sử dụng ref khai báo state trong Vue - Khoá học Vuejs từ cơ bản đến nâng cao - YouTube lah8il',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842522/9._S%E1%BB%AD_d%E1%BB%A5ng_ref_khai_b%C3%A1o_state_trong_Vue_-_Kho%C3%A1_h%E1%BB%8Dc_Vuejs_t%E1%BB%AB_c%C6%A1_b%E1%BA%A3n_%C4%91%E1%BA%BFn_n%C3%A2ng_cao_-_YouTube_lah8il.mp4',
            durationSeconds: 600,
            orderIndex: 3,
            isPreview: false,
          },
          {
            title: '8. Directives trong Vue - Khoá học Vuejs từ cơ bản đến nâng cao - YouTube b5jbxh',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842522/8._Directives_trong_Vue_-_Kho%C3%A1_h%E1%BB%8Dc_Vuejs_t%E1%BB%AB_c%C6%A1_b%E1%BA%A3n_%C4%91%E1%BA%BFn_n%C3%A2ng_cao_-_YouTube_b5jbxh.mp4',
            durationSeconds: 600,
            orderIndex: 4,
            isPreview: false,
          },
          {
            title: '15.Binding Class trong Vuejs - Khoá học Vuejs từ cơ bản đến nâng cao - YouTube jj0nay',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842520/15.Binding_Class_trong_Vuejs_-_Kho%C3%A1_h%E1%BB%8Dc_Vuejs_t%E1%BB%AB_c%C6%A1_b%E1%BA%A3n_%C4%91%E1%BA%BFn_n%C3%A2ng_cao_-_YouTube_jj0nay.mp4',
            durationSeconds: 600,
            orderIndex: 5,
            isPreview: false,
          },
        ],
      },
      {
        title: 'Module 3',
        orderIndex: 3,
        lessons: [
          {
            title: '13. Computed trong Vue là gì- - Khoá học Vuejs từ cơ bản đến nâng cao - YouTube xb35wz',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842520/13._Computed_trong_Vue_l%C3%A0_g%C3%AC-_-_Kho%C3%A1_h%E1%BB%8Dc_Vuejs_t%E1%BB%AB_c%C6%A1_b%E1%BA%A3n_%C4%91%E1%BA%BFn_n%C3%A2ng_cao_-_YouTube_xb35wz.mp4',
            durationSeconds: 600,
            orderIndex: 1,
            isPreview: false,
          },
          {
            title: '11.Deep Reactivity trong Vue - Khoá học Vuejs từ cơ bản đến nâng cao - Khoá học Vuejs từ cơ bản đến ',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842519/11.Deep_Reactivity_trong_Vue_-_Kho%C3%A1_h%E1%BB%8Dc_Vuejs_t%E1%BB%AB_c%C6%A1_b%E1%BA%A3n_%C4%91%E1%BA%BFn_n%C3%A2ng_cao_-_Kho%C3%A1_h%E1%BB%8Dc_Vuejs_t%E1%BB%AB_c%C6%A1_b%E1%BA%A3n_%C4%91%E1%BA%BFn_n%C3%A2n_-_YouTube_f3v9iy.mp4',
            durationSeconds: 600,
            orderIndex: 2,
            isPreview: false,
          },
          {
            title: '10. Tại sao cần sử dụng Refs trong Vue- - Khoá học Vuejs từ cơ bản đến nâng cao - Khoá học Vuejs từ ',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842520/10._T%E1%BA%A1i_sao_c%E1%BA%A7n_s%E1%BB%AD_d%E1%BB%A5ng_Refs_trong_Vue-_-_Kho%C3%A1_h%E1%BB%8Dc_Vuejs_t%E1%BB%AB_c%C6%A1_b%E1%BA%A3n_%C4%91%E1%BA%BFn_n%C3%A2ng_cao_-_Kho%C3%A1_h%E1%BB%8Dc_Vuejs_t%E1%BB%AB_c%C6%A1_b_-_YouTube_ntnjjs.mp4',
            durationSeconds: 600,
            orderIndex: 3,
            isPreview: false,
          },
          {
            title: '12. nextTick trong Vue - Khoá học Vuejs từ cơ bản đến nâng cao - YouTube viojdb',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842519/12._nextTick_trong_Vue_-_Kho%C3%A1_h%E1%BB%8Dc_Vuejs_t%E1%BB%AB_c%C6%A1_b%E1%BA%A3n_%C4%91%E1%BA%BFn_n%C3%A2ng_cao_-_YouTube_viojdb.mp4',
            durationSeconds: 600,
            orderIndex: 4,
            isPreview: false,
          },
          {
            title: '14.Writable computed trong vue là gì- - Khoá học Vuejs từ cơ bản đến nâng cao - YouTube bvcujr',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842518/14.Writable_computed_trong_vue_l%C3%A0_g%C3%AC-_-_Kho%C3%A1_h%E1%BB%8Dc_Vuejs_t%E1%BB%AB_c%C6%A1_b%E1%BA%A3n_%C4%91%E1%BA%BFn_n%C3%A2ng_cao_-_YouTube_bvcujr.mp4',
            durationSeconds: 600,
            orderIndex: 5,
            isPreview: false,
          },
        ],
      },
    ],
  },

  {
    title: 'AngularJS Fundamentals',
    slug: 'angularjs-fundamentals',
    description: `Học AngularJS cơ bản.
    
    Nội dung:
    - Modules và Controllers
    - Directives
    - Data binding
    - Services và HTTP
    - Filters và sorting`,
    categorySlug: 'frontend-development',
    tags: ["angular","angularjs","javascript"],
    estimatedDurationMinutes: 480,
    thumbnailUrl: 'https://res.cloudinary.com/demo/image/upload/v1/courses/angularjs-fundamentals-thumb.jpg',
    status: 'published',
    modules: [
      {
        title: 'Module 1',
        orderIndex: 1,
        lessons: [
          {
            title: 'AngularJS căn bản - Bài 2- Giới thiệu về modules và controllers ix9lwh',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842392/AngularJS_c%C4%83n_b%E1%BA%A3n_-_B%C3%A0i_2-_Gi%E1%BB%9Bi_thi%E1%BB%87u_v%E1%BB%81_modules_v%C3%A0_controllers_ix9lwh.mp4',
            durationSeconds: 600,
            orderIndex: 1,
            isPreview: true,
          },
          {
            title: 'AngularJS căn bản - Bài 3- Binding đối tượng từ Controller ra View fqucmc',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842391/AngularJS_c%C4%83n_b%E1%BA%A3n_-_B%C3%A0i_3-_Binding_%C4%91%E1%BB%91i_t%C6%B0%E1%BB%A3ng_t%E1%BB%AB_Controller_ra_View_fqucmc.mp4',
            durationSeconds: 600,
            orderIndex: 2,
            isPreview: false,
          },
          {
            title: 'AngularJS căn bản - Bài 4- Biến scope và rootScope idl0lg',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842391/AngularJS_c%C4%83n_b%E1%BA%A3n_-_B%C3%A0i_4-_Bi%E1%BA%BFn_scope_v%C3%A0_rootScope_idl0lg.mp4',
            durationSeconds: 600,
            orderIndex: 3,
            isPreview: false,
          },
          {
            title: 'AngularJS căn bản - Bài 6- Sử dụng ng repeat directive fuyfsf',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842390/AngularJS_c%C4%83n_b%E1%BA%A3n_-_B%C3%A0i_6-_S%E1%BB%AD_d%E1%BB%A5ng_ng_repeat_directive_fuyfsf.mp4',
            durationSeconds: 600,
            orderIndex: 4,
            isPreview: false,
          },
          {
            title: 'AngularJS căn bản - Bài 5- Tìm hiểu Directive uvhrm6',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842389/AngularJS_c%C4%83n_b%E1%BA%A3n_-_B%C3%A0i_5-_T%C3%ACm_hi%E1%BB%83u_Directive_uvhrm6.mp4',
            durationSeconds: 600,
            orderIndex: 5,
            isPreview: false,
          },
        ],
      },
      {
        title: 'Module 2',
        orderIndex: 2,
        lessons: [
          {
            title: 'AngularJS căn bản - Bài 1- Giới thiệu tổng quan về AngularJS v56ahx',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842390/AngularJS_c%C4%83n_b%E1%BA%A3n_-_B%C3%A0i_1-_Gi%E1%BB%9Bi_thi%E1%BB%87u_t%E1%BB%95ng_quan_v%E1%BB%81_AngularJS_v56ahx.mp4',
            durationSeconds: 600,
            orderIndex: 1,
            isPreview: false,
          },
          {
            title: 'AngularJS căn bản - Bài 8  Sử dụng filter ssts8u',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842386/AngularJS_c%C4%83n_b%E1%BA%A3n_-_B%C3%A0i_8__S%E1%BB%AD_d%E1%BB%A5ng_filter_ssts8u.mp4',
            durationSeconds: 600,
            orderIndex: 2,
            isPreview: false,
          },
          {
            title: 'AngularJS căn bản - Bài 7- Bắt sự kiện click dhnfmr',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842386/AngularJS_c%C4%83n_b%E1%BA%A3n_-_B%C3%A0i_7-_B%E1%BA%AFt_s%E1%BB%B1_ki%E1%BB%87n_click_dhnfmr.mp4',
            durationSeconds: 600,
            orderIndex: 3,
            isPreview: false,
          },
          {
            title: 'AngularJS căn bản - Bài 10- Sắp xếp dữ liệu sử dụng header click trên table x60yfy',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842386/AngularJS_c%C4%83n_b%E1%BA%A3n_-_B%C3%A0i_10-_S%E1%BA%AFp_x%E1%BA%BFp_d%E1%BB%AF_li%E1%BB%87u_s%E1%BB%AD_d%E1%BB%A5ng_header_click_tr%C3%AAn_table_x60yfy.mp4',
            durationSeconds: 600,
            orderIndex: 4,
            isPreview: false,
          },
          {
            title: 'AngularJS căn bản - Bài 9- Sắp xếp dữ liệu peuh85',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842386/AngularJS_c%C4%83n_b%E1%BA%A3n_-_B%C3%A0i_9-_S%E1%BA%AFp_x%E1%BA%BFp_d%E1%BB%AF_li%E1%BB%87u_peuh85.mp4',
            durationSeconds: 600,
            orderIndex: 5,
            isPreview: false,
          },
        ],
      },
      {
        title: 'Module 3',
        orderIndex: 3,
        lessons: [
          {
            title: 'AngularJS căn bản - Bài 14- Cách gọi Web Service anawyc',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842384/AngularJS_c%C4%83n_b%E1%BA%A3n_-_B%C3%A0i_14-_C%C3%A1ch_g%E1%BB%8Di_Web_Service_anawyc.mp4',
            durationSeconds: 600,
            orderIndex: 1,
            isPreview: false,
          },
          {
            title: 'AngularJS căn bản - Bài 16- Cách tạo custom Service hahcfb',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842382/AngularJS_c%C4%83n_b%E1%BA%A3n_-_B%C3%A0i_16-_C%C3%A1ch_t%E1%BA%A1o_custom_Service_hahcfb.mp4',
            durationSeconds: 600,
            orderIndex: 2,
            isPreview: false,
          },
          {
            title: 'AngularJS căn bản - Bài 13- Cách sử dụng ng-include zhnfr8',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842382/AngularJS_c%C4%83n_b%E1%BA%A3n_-_B%C3%A0i_13-_C%C3%A1ch_s%E1%BB%AD_d%E1%BB%A5ng_ng-include_zhnfr8.mp4',
            durationSeconds: 600,
            orderIndex: 3,
            isPreview: false,
          },
          {
            title: 'AngularJS căn bản - Bài 12- Sử dụng ng hide và ng show ky3gin',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842381/AngularJS_c%C4%83n_b%E1%BA%A3n_-_B%C3%A0i_12-_S%E1%BB%AD_d%E1%BB%A5ng_ng_hide_v%C3%A0_ng_show_ky3gin.mp4',
            durationSeconds: 600,
            orderIndex: 4,
            isPreview: false,
          },
          {
            title: 'AngularJS căn bản - Bài 15- Tìm hiểu về AngularJS Service cwv38j',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842380/AngularJS_c%C4%83n_b%E1%BA%A3n_-_B%C3%A0i_15-_T%C3%ACm_hi%E1%BB%83u_v%E1%BB%81_AngularJS_Service_cwv38j.mp4',
            durationSeconds: 600,
            orderIndex: 5,
            isPreview: false,
          },
        ],
      },
      {
        title: 'Module 4',
        orderIndex: 4,
        lessons: [
          {
            title: 'AngularJS căn bản - Bài 11- Lọc dữ liệu sử dụng AngularJS Filter tjnbgr',
            lessonType: 'video',
            contentText: 'Video lesson',
            videoUrl: 'https://res.cloudinary.com/ds52btbjy/video/upload/v1775842380/AngularJS_c%C4%83n_b%E1%BA%A3n_-_B%C3%A0i_11-_L%E1%BB%8Dc_d%E1%BB%AF_li%E1%BB%87u_s%E1%BB%AD_d%E1%BB%A5ng_AngularJS_Filter_tjnbgr.mp4',
            durationSeconds: 600,
            orderIndex: 1,
            isPreview: false,
          },
        ],
      },
    ],
  },

];


async function seedCoursesFromCloudinary(context) {
  console.log('🎓 Seeding courses from Cloudinary videos...\n');

  const prisma = context.prisma;

  try {
    const departments = await prisma.department.findMany();
    const categories = await prisma.category.findMany();
    const tags = await prisma.tag.findMany();
    
    const trainers = await prisma.user.findMany({
      where: { email: { contains: 'trainer' } },
      take: 3,
    });

    if (trainers.length === 0) {
      console.log('⚠️  No trainers found. Skipping...');
      return [];
    }

    const createdCourses = [];
    let courseIndex = 0;

    for (const courseData of COURSES_DATA) {
      console.log(`📝 Creating course: ${courseData.title}`);

      const category = categories.find(c => c.slug === courseData.categorySlug);
      const trainer = trainers[courseIndex % trainers.length];
      const department = departments[courseIndex % departments.length];

      // Generate thumbnail URL from Cloudinary (uploaded images)
      const thumbnailUrl = getCourseThumbnailUrl(courseData.slug) || 
        `https://images.unsplash.com/photo-${getThumbnailId(courseData.slug)}?w=800&h=450&fit=crop`;

      const course = await prisma.course.create({
        data: {
          ownerDepartmentId: department.id,
          trainerUserId: trainer.id,
          categoryId: category?.id,
          title: courseData.title,
          slug: courseData.slug,
          description: courseData.description,
          thumbnailUrl: thumbnailUrl,
          status: courseData.status,
          estimatedDurationMinutes: courseData.estimatedDurationMinutes,
          publishedAt: new Date(),
          mediaFolder: `staffup-lms/courses/${courseData.slug}`,
        },
      });

      // Add tags
      if (courseData.tags && courseData.tags.length > 0) {
        for (const tagName of courseData.tags) {
          const tag = tags.find(t => t.name.toLowerCase() === tagName.toLowerCase());
          if (tag) {
            await prisma.courseTag.create({
              data: { courseId: course.id, tagId: tag.id },
            });
          }
        }
      }

      // Create modules and lessons
      let totalLessons = 0;
      for (const moduleData of courseData.modules) {
        const module = await prisma.module.create({
          data: {
            courseId: course.id,
            title: moduleData.title,
            orderIndex: moduleData.orderIndex,
          },
        });

        for (const lessonData of moduleData.lessons) {
          await prisma.lesson.create({
            data: {
              moduleId: module.id,
              title: lessonData.title,
              lessonType: lessonData.lessonType,
              contentText: lessonData.contentText,
              videoUrl: lessonData.videoUrl,
              durationSeconds: lessonData.durationSeconds,
              orderIndex: lessonData.orderIndex,
              isPreview: lessonData.isPreview,
            },
          });
          totalLessons++;
        }
      }

      console.log(`   ✅ Created ${courseData.modules.length} modules, ${totalLessons} lessons`);
      createdCourses.push(course);
      courseIndex++;
    }

    console.log(`\n✅ Created ${createdCourses.length} courses from Cloudinary\n`);
    return createdCourses;
  } catch (error) {
    console.error('❌ Error seeding courses:', error);
    throw error;
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('   CLOUDINARY COURSE SEED - STAFFUP LMS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const context = createSeedContext();

  try {
    await seedCoursesFromCloudinary(context);

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('   ✅ SEED COMPLETED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════════════════════════\n');
  } catch (error) {
    console.error('\n❌ SEED FAILED:', error);
    process.exit(1);
  } finally {
    await disposeSeedContext(context);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { seedCoursesFromCloudinary, COURSES_DATA };
