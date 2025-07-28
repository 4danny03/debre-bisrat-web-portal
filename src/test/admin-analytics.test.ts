// This file must be .tsx to support JSX

import { describe, it, expect, vi } from 'vitest';
import { render } from './test-utils';

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: vi.fn(() => ({ select: vi.fn(() => ({ gte: vi.fn(() => ({ data: [], count: 0 }) ) }) ) })) }
}));
vi.mock("@/components/ui/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));

import Analytics from '../pages/admin/Analytics';

describe('AdminAnalytics', () => {
  it('should render without crashing', () => {
    // @ts-expect-error: JSX/TSX import workaround
    const { container } = render(<Analytics />);
    expect(container).toBeDefined();
  });
});
