/**
 * Mock Supabase Client for Demo Mode
 * 
 * This mock implements the minimum required interface for the @supabase/supabase-js client
 * to ensure that the application functions perfectly even without real credentials.
 */

const createMockProxy = (name: string, data: any = {}) => {
  return new Proxy(() => {}, {
    get: (target, prop) => {
      if (typeof prop === 'string') {
        // Handle common methods
        if (['from', 'select', 'insert', 'update', 'delete', 'eq', 'single', 'order', 'gte', 'lte', 'match', 'channel', 'on', 'subscribe', 'removeChannel'].includes(prop)) {
          return () => createMockProxy(prop, data);
        }
        if (prop === 'data') return data;
        if (prop === 'error') return null;
      }
      return createMockProxy(prop.toString(), data);
    },
    apply: () => {
        return { data, error: null };
    }
  });
};

export const createMockSupabase = () => {
    return {
        from: (table: string) => {
            return {
                select: () => ({
                    eq: () => ({
                        single: async () => ({ data: null, error: null }),
                        order: () => ({
                            async then(resolve: any) { resolve({ data: [], error: null }); }
                        }),
                        async then(resolve: any) { resolve({ data: [], error: null }); }
                    }),
                    async then(resolve: any) { resolve({ data: [], error: null }); }
                }),
                insert: () => ({
                    select: () => ({
                        single: async () => ({ data: {}, error: null }),
                        async then(resolve: any) { resolve({ data: {}, error: null }); }
                    }),
                    async then(resolve: any) { resolve({ data: {}, error: null }); }
                }),
                update: () => ({
                    eq: async () => ({ data: null, error: null }),
                    async then(resolve: any) { resolve({ data: null, error: null }); }
                })
            };
        },
        auth: {
            getSession: async () => ({ data: { session: null }, error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
            signInWithPassword: async () => ({ data: { user: { id: 'demo-user' } }, error: null }),
            signOut: async () => ({ error: null }),
            resetPasswordForEmail: async () => ({ data: {}, error: null }),
            updateUser: async () => ({ data: {}, error: null }),
        },
        channel: () => ({
            on: () => ({
                subscribe: () => ({ unsubscribe: () => {} })
            }),
            subscribe: () => ({ unsubscribe: () => {} })
        }),
        removeChannel: async () => {}
    } as any;
};
