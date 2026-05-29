import { marked } from 'marked';
import termsRaw from '../content/ko/terms.md?raw';
import privacyRaw from '../content/ko/privacy.md?raw';

/**
 * 내부 메모 섹션(변호사 review / placeholder 체크리스트)을 잘라낸다.
 * "⚠️ 변호사 review" 또는 "✏️ 게시 전" 헤딩이 처음 등장하는 지점부터 끝까지를 모두 제거.
 * 바로 위의 `---` 구분선도 함께 제거.
 */
function stripInternalSections(md: string): string {
  const lines = md.split('\n');
  let cutAt = lines.length;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^##\s+⚠️/.test(line) || /^##\s+✏️/.test(line)) {
      let j = i - 1;
      while (j >= 0 && lines[j].trim() === '') j--;
      if (j >= 0 && lines[j].trim() === '---') {
        cutAt = j;
      } else {
        cutAt = i;
      }
      break;
    }
  }

  return lines.slice(0, cutAt).join('\n').trimEnd();
}

const sources = {
  terms: termsRaw,
  privacy: privacyRaw,
} as const;

export function renderLegalDoc(slug: 'terms' | 'privacy'): string {
  const cleaned = stripInternalSections(sources[slug]);
  return marked.parse(cleaned, { async: false }) as string;
}
