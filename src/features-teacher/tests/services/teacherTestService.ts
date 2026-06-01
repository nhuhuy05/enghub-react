import { questionGroupService } from './questionGroupService';
import { testCollectionService } from './testCollectionService';
import { testImportService } from './testImportService';
import { testMediaService } from './testMediaService';
import { testPreviewPublishService } from './testPreviewPublishService';

export const teacherTestService = {
  ...testCollectionService,
  ...testMediaService,
  ...testImportService,
  ...questionGroupService,
  ...testPreviewPublishService,
};
