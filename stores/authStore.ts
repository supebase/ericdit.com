interface User {
  id: string;
  email: string;
  first_name: string;
  avatar: string;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    isLoggedIn: false,
    loading: false,
  }),
  actions: {
    async checkLoginStatus() {
      const { $authClient, $readMe } = useNuxtApp();
      
      this.loading = true;
      try {
        const user = await $authClient.request($readMe({ fields: ['id', 'email', 'first_name', 'avatar'] })) as User;
        this.setUser(user);
      } catch {
        this.clearUser();
      } finally {
        this.loading = false;
      }
    },
    setUser(user: User) {
      this.user = user;
      this.isLoggedIn = !!user;
    },
    clearUser() {
      this.user = null;
      this.isLoggedIn = false;
    },
  },
});