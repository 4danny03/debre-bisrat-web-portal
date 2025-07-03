// Enhanced stub for supabase client to match Settings.tsx usage
export const supabase = {
  from: (_table: string) => ({
    select: (_query?: string) => ({
      limit: (_n?: number) => ({
        single: async () => ({
          data: {},
          error: null,
        }),
      }),
      single: async () => ({
        data: {},
        error: null,
      }),
    }),
    insert: (_data: any) => ({
      select: () => ({
        single: async () => ({
          data: {},
          error: null,
        }),
      }),
    }),
    upsert: async (_data: any) => ({
      data: {},
      error: null,
    }),
  }),
};
