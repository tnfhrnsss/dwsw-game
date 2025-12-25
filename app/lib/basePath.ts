// GitHub Pages 배포를 위한 basePath 처리
export const BASE_PATH = '/dwsw-game';

export function getAssetPath(path: string): string {
  return `${BASE_PATH}${path}`;
}
