// =========================================================================
// CONFIGURAÇÃO DO SERVIDOR (COLE SUAS CHAVES DO SUPABASE ABAIXO)
// =========================================================================
const SUPABASE_URL = 'https://yqyytdvhcxfjkugjerme.supabase.co/rest/v1/';
const SUPABASE_ANON_KEY = 'sb_publishable_FZSVXEBEqr27PzRGq8ElSg_S4pfjPxD';
const CATALOG_JSON_URL = './musicas.json';

const isSupabaseConfigured =
  SUPABASE_URL.indexOf('http') === 0 &&
  SUPABASE_ANON_KEY.length > 20;

let supabaseClient = null;
if (isSupabaseConfigured && window.supabase) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Catálogo padrão de demonstração (usado caso musicas.json não esteja acessível)
const FALLBACK_CATALOG = [
  {
    id: 'nile-1',
    title: 'Golden Horizon',
    artist: 'Solaris',
    artistImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80',
    album: 'Nile Sessions Vol. 1',
    genre: 'Electronic',
    cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  },
  {
    id: 'nile-2',
    title: 'Blue Delta Breeze',
    artist: 'Solaris',
    artistImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80',
    album: 'Nile Sessions Vol. 1',
    genre: 'Electronic',
    cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=80',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
  },
  {
    id: 'nile-3',
    title: 'Midnight Mirage',
    artist: 'Luna Wave',
    artistImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
    album: 'Echoes of Cairo',
    genre: 'Chillwave',
    cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
  },
  {
    id: 'nile-4',
    title: 'Oasis Lights',
    artist: 'Luna Wave',
    artistImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
    album: 'Echoes of Cairo',
    genre: 'Chillwave',
    cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&auto=format&fit=crop&q=80',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
  },
  {
    id: 'nile-5',
    title: 'Velvet Dunes',
    artist: 'Kairo',
    artistImage: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&auto=format&fit=crop&q=80',
    album: 'Sun & River',
    genre: 'Ambient Pop',
    cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&auto=format&fit=crop&q=80',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3'
  },
  {
    id: 'nile-6',
    title: 'Azure Current',
    artist: 'Aether',
    artistImage: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&auto=format&fit=crop&q=80',
    album: 'Deep Waters',
    genre: 'Indie Electronic',
    cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&auto=format&fit=crop&q=80',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3'
  }
];

const { createApp } = Vue;

createApp({
  data() {
    return {
      isSupabaseConfigured: isSupabaseConfigured,
      currentView: 'home',
      sidebarOpen: false,
      isLoading: false,

      // Estado de Usuário e Autenticação
      user: null,
      authMode: 'login',
      authLoading: false,
      authPromptMessage: '',
      pendingAction: null,
      authForm: { displayName: '', email: '', password: '' },

      // Estado de Edição de Perfil
      profileSaving: false,
      profileForm: {
        displayName: '',
        bio: '',
        avatarUrl: '',
        avatarFile: null,
        avatarPreview: ''
      },

      // Estado do Motor de Áudio
      currentTrack: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 0.8,
      isMuted: false,
      isShuffle: false,
      isRepeat: false,

      // Coleções de Conteúdo
      catalogTracks: [],
      searchResults: [],
      likedTracks: [],
      favoriteArtists: [],
      playlists: [
        { id: 'pl-1', name: 'Favoritas do Nilo', description: 'Seleção suave para relaxar', tracks: [] }
      ],

      // Páginas de Artista e Álbum
      artistData: null,
      albumData: null,

      // Busca e Filtros
      searchQuery: '',
      searchFilterTab: 'all',

      // Modais
      activeModal: null,
      trackToAdd: null,
      activePlaylistId: null,

      // Formulários e Notificações
      newPlaylistForm: { name: '', description: '' },
      toast: { visible: false, message: '', type: 'success' },
      toastTimer: null
    };
  },

  async mounted() {
    if (this.$refs.audioRef) {
      this.$refs.audioRef.volume = this.volume;
    }

    // 1. Carrega o catálogo de músicas (musicas.json)
    await this.loadServerCatalog();

    // 2. Restaura sessão do usuário (Supabase ou LocalStorage)
    await this.restoreUserSession();
  },

  computed: {
    activePlaylist() {
      return (this.playlists || []).find(p => p.id === this.activePlaylistId) || null;
    },

    popularArtists() {
      const map = new Map();
      (this.catalogTracks || []).forEach(track => {
        if (track.artist && !map.has(track.artist)) {
          map.set(track.artist, {
            name: track.artist,
            genre: track.genre || 'Música',
            image: track.artistImage || track.cover
          });
        }
      });
      return Array.from(map.values());
    },

    catalogAlbums() {
      const map = new Map();
      (this.catalogTracks || []).forEach(track => {
        const albumName = track.album || 'Single';
        const artistName = track.artist || 'Artista Desconhecido';
        const key = albumName.toLowerCase() + '__' + artistName.toLowerCase();

        if (!map.has(key)) {
          map.set(key, {
            name: albumName,
            artist: artistName,
            cover: track.cover,
            genre: track.genre || 'Música',
            tracks: []
          });
        }
        map.get(key).tracks.push(track);
      });
      return Array.from(map.values());
    },

    matchedArtists() {
      const q = (this.searchQuery || '').trim().toLowerCase();
      if (!q) return this.popularArtists;

      return this.popularArtists.filter(artist => {
        const directMatch =
          (artist.name && artist.name.toLowerCase().indexOf(q) !== -1) ||
          (artist.genre && artist.genre.toLowerCase().indexOf(q) !== -1);

        const hasMatchingTrack = this.searchResults.some(
          t => t.artist && t.artist.toLowerCase() === artist.name.toLowerCase()
        );

        return directMatch || hasMatchingTrack;
      });
    },

    matchedAlbums() {
      const q = (this.searchQuery || '').trim().toLowerCase();
      if (!q) return this.catalogAlbums;

      return this.catalogAlbums.filter(album => {
        const directMatch =
          (album.name && album.name.toLowerCase().indexOf(q) !== -1) ||
          (album.artist && album.artist.toLowerCase().indexOf(q) !== -1) ||
          (album.genre && album.genre.toLowerCase().indexOf(q) !== -1);

        const hasMatchingTrack = album.tracks.some(
          t => t.title && t.title.toLowerCase().indexOf(q) !== -1
        );

        return directMatch || hasMatchingTrack;
      });
    }
  },

  methods: {
    // --- NAVEGAÇÃO ---
    navigate(view) {
      this.currentView = view;
      this.sidebarOpen = false;
      if (view === 'search' && !this.searchQuery) {
        this.searchResults = this.catalogTracks.slice();
      }
    },

    // --- CARREGAMENTO DO CATÁLOGO JSON ---
    async loadServerCatalog() {
      this.isLoading = true;
      try {
        const response = await fetch(CATALOG_JSON_URL, { cache: 'no-store' });
        if (!response.ok) throw new Error('Arquivo JSON não encontrado');
        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
          this.catalogTracks = data.filter(t => t.url);
        } else {
          this.catalogTracks = FALLBACK_CATALOG;
        }
      } catch (err) {
        this.catalogTracks = FALLBACK_CATALOG;
      } finally {
        this.searchResults = this.catalogTracks.slice();
        this.isLoading = false;
      }
    },

    searchCatalog() {
      const q = (this.searchQuery || '').trim().toLowerCase();
      if (!q) {
        this.searchResults = this.catalogTracks.slice();
        return;
      }

      this.searchResults = this.catalogTracks.filter(track =>
        (track.title && track.title.toLowerCase().indexOf(q) !== -1) ||
        (track.artist && track.artist.toLowerCase().indexOf(q) !== -1) ||
        (track.album && track.album.toLowerCase().indexOf(q) !== -1) ||
        (track.genre && track.genre.toLowerCase().indexOf(q) !== -1)
      );
    },

    openArtistPage(artistName) {
      const tracks = this.catalogTracks.filter(
        t => t.artist && t.artist.toLowerCase() === artistName.toLowerCase()
      );

      const firstTrack = tracks[0] || {};
      this.artistData = {
        name: artistName,
        genre: firstTrack.genre || 'Música',
        image: firstTrack.artistImage || firstTrack.cover || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
        tracks: tracks
      };

      this.currentView = 'artist';
      this.sidebarOpen = false;
    },

    openAlbumPage(album) {
      this.albumData = album;
      this.currentView = 'album';
      this.sidebarOpen = false;
    },

    openAlbumByName(albumName, artistName) {
      const found = this.catalogAlbums.find(
        a => a.name.toLowerCase() === (albumName || '').toLowerCase() &&
             a.artist.toLowerCase() === (artistName || '').toLowerCase()
      );
      if (found) {
        this.openAlbumPage(found);
      }
    },

    openPlaylist(p) {
      this.activePlaylistId = p.id;
      this.currentView = 'playlist';
      this.sidebarOpen = false;
    },

    // --- AUDIO PLAYER ENGINE ---
    playTrack(track) {
      if (!track || !track.url) {
        this.showToast('Prévia de áudio indisponível para esta faixa.', 'error');
        return;
      }

      if (this.currentTrack && this.currentTrack.id === track.id) {
        this.togglePlay();
        return;
      }

      this.currentTrack = track;
      this.$nextTick(() => {
        const player = this.$refs.audioRef;
        if (!player) return;
        player.src = track.url;
        player.play().then(() => {
          this.isPlaying = true;
        }).catch(() => {
          this.isPlaying = false;
          this.showToast('Erro ao tocar áudio.', 'error');
        });
      });
    },

    playTrackList(list) {
      if (!list || list.length === 0) return;
      this.playTrack(list[0]);
    },

    togglePlay() {
      const player = this.$refs.audioRef;
      if (!this.currentTrack) {
        if (this.catalogTracks.length > 0) this.playTrack(this.catalogTracks[0]);
        return;
      }

      if (this.isPlaying) {
        player.pause();
        this.isPlaying = false;
      } else {
        player.play().then(() => {
          this.isPlaying = true;
        }).catch(() => {
          this.isPlaying = false;
        });
      }
    },

    prevTrack() {
      if (!this.currentTrack || this.catalogTracks.length === 0) return;
      const currentList = this.searchResults.length > 0 ? this.searchResults : this.catalogTracks;
      const idx = currentList.findIndex(t => t.id === this.currentTrack.id);
      const prevIdx = (idx - 1 + currentList.length) % currentList.length;
      this.playTrack(currentList[prevIdx]);
    },

    nextTrack() {
      if (!this.currentTrack || this.catalogTracks.length === 0) return;
      const currentList = this.searchResults.length > 0 ? this.searchResults : this.catalogTracks;
      
      if (this.isShuffle) {
        const rand = Math.floor(Math.random() * currentList.length);
        this.playTrack(currentList[rand]);
        return;
      }

      const idx = currentList.findIndex(t => t.id === this.currentTrack.id);
      const nextIdx = (idx + 1) % currentList.length;
      this.playTrack(currentList[nextIdx]);
    },

    onTrackEnded() {
      if (this.isRepeat) {
        const player = this.$refs.audioRef;
        player.currentTime = 0;
        player.play();
      } else {
        this.nextTrack();
      }
    },

    onAudioError() {
      this.isPlaying = false;
      this.showToast('Não foi possível carregar o arquivo de áudio.', 'error');
    },

    onTimeUpdate() {
      if (this.$refs.audioRef) {
        this.currentTime = this.$refs.audioRef.currentTime || 0;
      }
    },

    onLoadedMetadata() {
      if (this.$refs.audioRef) {
        this.duration = this.$refs.audioRef.duration || 0;
      }
    },

    seekAudio(val) {
      const parsed = parseFloat(val);
      if (this.$refs.audioRef && !isNaN(parsed)) {
        this.$refs.audioRef.currentTime = parsed;
        this.currentTime = parsed;
      }
    },

    setVolume(val) {
      this.volume = parseFloat(val);
      this.isMuted = this.volume === 0;
      if (this.$refs.audioRef) {
        this.$refs.audioRef.volume = this.volume;
      }
    },

    toggleMute() {
      this.isMuted = !this.isMuted;
      if (this.$refs.audioRef) {
        this.$refs.audioRef.volume = this.isMuted ? 0 : this.volume;
      }
    },

    formatTime(seconds) {
      if (!seconds || isNaN(seconds)) return '00:00';
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;
    },

    // --- VERIFICAÇÃO DE LOGIN E AÇÃO PENDENTE APÓS ENTRAR ---
    requireAuth(message, pendingAction) {
      if (this.user) return true;
      this.pendingAction = pendingAction || null;
      this.openAuthModal(message || 'Faça login ou crie uma conta para salvar suas músicas favoritas!');
      return false;
    },

    openAuthModal(message) {
      this.authPromptMessage = message || '';
      this.authMode = 'login';
      this.activeModal = 'auth';
    },

    executePendingAction() {
      if (!this.pendingAction || !this.user) return;
      const action = this.pendingAction;
      this.pendingAction = null;

      if (action.type === 'likeTrack' && action.payload) {
        if (!this.isTrackLiked(action.payload.id)) {
          this.likedTracks.push(action.payload);
          this.syncUserDataToCloud();
          this.showToast('"' + action.payload.title + '" salva nos favoritos!');
        }
      } else if (action.type === 'favoriteArtist' && action.payload) {
        if (!this.isArtistFavorited(action.payload.name)) {
          this.favoriteArtists.push(action.payload);
          this.syncUserDataToCloud();
          this.showToast('"' + action.payload.name + '" adicionado aos artistas favoritos!');
        }
      } else if (action.type === 'createPlaylist') {
        this.activeModal = 'createPlaylist';
      } else if (action.type === 'addToPlaylist' && action.payload) {
        this.trackToAdd = action.payload;
        this.activeModal = 'addToPlaylist';
      }
    },

    // --- LIKED TRACKS (BOTÃO DE CURTIR) ---
    isTrackLiked(trackId) {
      if (!this.user) return false;
      return this.likedTracks.some(t => t.id === trackId);
    },

    toggleLikeTrack(track) {
      if (!this.requireAuth(
        'Entre na sua conta para salvar "' + track.title + '" nos seus favoritos!',
        { type: 'likeTrack', payload: track }
      )) {
        return;
      }

      const idx = this.likedTracks.findIndex(t => t.id === track.id);
      if (idx > -1) {
        this.likedTracks.splice(idx, 1);
        this.showToast('"' + track.title + '" removida dos favoritos.');
      } else {
        this.likedTracks.push(track);
        this.showToast('"' + track.title + '" salva nos favoritos!');
      }
      this.syncUserDataToCloud();
    },

    // --- FAVORITE ARTISTS ---
    isArtistFavorited(artistName) {
      if (!this.user) return false;
      return this.favoriteArtists.some(a => a.name.toLowerCase() === artistName.toLowerCase());
    },

    toggleFavoriteArtist(artist) {
      if (!this.requireAuth(
        'Entre na sua conta para favoritar "' + artist.name + '"!',
        { type: 'favoriteArtist', payload: artist }
      )) {
        return;
      }

      const idx = this.favoriteArtists.findIndex(a => a.name.toLowerCase() === artist.name.toLowerCase());
      if (idx > -1) {
        this.favoriteArtists.splice(idx, 1);
        this.showToast('"' + artist.name + '" removido dos favoritos.');
      } else {
        this.favoriteArtists.push(artist);
        this.showToast('"' + artist.name + '" adicionado aos artistas favoritos!');
      }
      this.syncUserDataToCloud();
    },

    // --- PLAYLIST MANAGEMENT ---
    handleOpenCreatePlaylist() {
      if (!this.requireAuth('Faça login para criar suas próprias playlists!', { type: 'createPlaylist' })) {
        return;
      }
      this.activeModal = 'createPlaylist';
    },

    createPlaylist() {
      if (!this.requireAuth('Faça login para criar uma playlist!')) return;
      if (!this.newPlaylistForm.name) return;

      const pl = {
        id: 'pl-' + Date.now(),
        name: this.newPlaylistForm.name,
        description: this.newPlaylistForm.description || '',
        tracks: []
      };

      this.playlists.push(pl);
      this.showToast('Playlist "' + pl.name + '" criada!');
      this.newPlaylistForm = { name: '', description: '' };
      this.closeModal();
      this.syncUserDataToCloud();
    },

    openAddToPlaylistModal(track) {
      if (!this.requireAuth('Faça login para adicionar músicas às suas playlists!', { type: 'addToPlaylist', payload: track })) {
        return;
      }
      this.trackToAdd = track;
      this.activeModal = 'addToPlaylist';
    },

    addTrackToPlaylist(playlistId, track) {
      const pl = this.playlists.find(p => p.id === playlistId);
      if (pl) {
        if (!pl.tracks.some(t => t.id === track.id)) {
          pl.tracks.push(track);
          this.showToast('Música adicionada à playlist "' + pl.name + '"');
          this.syncUserDataToCloud();
        } else {
          this.showToast('Esta música já está na playlist.');
        }
      }
      this.closeModal();
    },

    removeFromPlaylist(playlistId, trackId) {
      const pl = this.playlists.find(p => p.id === playlistId);
      if (pl) {
        pl.tracks = pl.tracks.filter(t => t.id !== trackId);
        this.showToast('Música removida da playlist.');
        this.syncUserDataToCloud();
      }
    },

    deletePlaylist(playlistId) {
      this.playlists = this.playlists.filter(p => p.id !== playlistId);
      this.currentView = 'library';
      this.showToast('Playlist excluída.');
      this.syncUserDataToCloud();
    },

    // =====================================================================
    // AUTENTICAÇÃO, PERFIL E SINCRONIZAÇÃO COM SUPABASE
    // =====================================================================
    async restoreUserSession() {
      if (supabaseClient) {
        const res = await supabaseClient.auth.getSession();
        const sessionUser = res && res.data && res.data.session && res.data.session.user;
        if (sessionUser) {
          await this.loadSupabaseProfile(sessionUser);
        }
      } else {
        const savedEmail = localStorage.getItem('nile_active_email');
        if (savedEmail) {
          this.loadLocalProfile(savedEmail);
        }
      }
    },

    async handleAuthSubmit() {
      if (!this.authForm.email || !this.authForm.password) return;
      this.authLoading = true;

      try {
        if (supabaseClient) {
          if (this.authMode === 'register') {
            const displayName = this.authForm.displayName || this.authForm.email.split('@')[0];
            const res = await supabaseClient.auth.signUp({
              email: this.authForm.email,
              password: this.authForm.password,
              options: { data: { display_name: displayName } }
            });

            if (res.error) throw res.error;

            if (res.data && res.data.user) {
              await supabaseClient.from('profiles').upsert({
                id: res.data.user.id,
                display_name: displayName,
                avatar_url: '',
                bio: '',
                liked_track_ids: [],
                favorite_artists: [],
                playlists: this.playlists
              });
              await this.loadSupabaseProfile(res.data.user);
              this.showToast('Conta criada! Bem-vindo ao Nile, ' + displayName + '!');
              this.closeModal();
              this.executePendingAction();
            }
          } else {
            const res = await supabaseClient.auth.signInWithPassword({
              email: this.authForm.email,
              password: this.authForm.password
            });

            if (res.error) throw res.error;

            if (res.data && res.data.user) {
              await this.loadSupabaseProfile(res.data.user);
              this.showToast('Bem-vindo de volta, ' + this.user.displayName + '!');
              this.closeModal();
              this.executePendingAction();
            }
          }
        } else {
          // Fallback local caso as chaves do Supabase ainda não estejam preenchidas
          const email = this.authForm.email.toLowerCase();
          const existing = localStorage.getItem('nile_profile_' + email);

          if (this.authMode === 'register' || !existing) {
            const newProfile = {
              id: 'local-' + Date.now(),
              email: email,
              displayName: this.authForm.displayName || email.split('@')[0],
              avatarUrl: '',
              bio: '',
              likedTracks: this.likedTracks,
              favoriteArtists: this.favoriteArtists,
              playlists: this.playlists
            };
            localStorage.setItem('nile_profile_' + email, JSON.stringify(newProfile));
          }

          localStorage.setItem('nile_active_email', email);
          this.loadLocalProfile(email);
          this.showToast('Bem-vindo ao Nile, ' + this.user.displayName + '!');
          this.closeModal();
          this.executePendingAction();
        }

        this.authForm = { displayName: '', email: '', password: '' };
        this.authPromptMessage = '';
      } catch (err) {
        this.showToast('Erro: ' + (err.message || 'Falha na autenticação.'), 'error');
      } finally {
        this.authLoading = false;
      }
    },

    async loadSupabaseProfile(authUser) {
      const res = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      const profile = res && res.data;
      const metaName = authUser.user_metadata && authUser.user_metadata.display_name;
      const fallbackName = metaName || authUser.email.split('@')[0];

      if (profile) {
        this.user = {
          id: authUser.id,
          email: authUser.email,
          displayName: profile.display_name || fallbackName,
          avatarUrl: profile.avatar_url || '',
          bio: profile.bio || ''
        };

        const likedIds = Array.isArray(profile.liked_track_ids) ? profile.liked_track_ids : [];
        this.likedTracks = this.catalogTracks.filter(t => likedIds.indexOf(t.id) !== -1);

        this.favoriteArtists = Array.isArray(profile.favorite_artists) ? profile.favorite_artists : [];

        if (Array.isArray(profile.playlists)) {
          this.playlists = profile.playlists.map(pl => ({
            id: pl.id,
            name: pl.name,
            description: pl.description || '',
            tracks: (pl.trackIds || [])
              .map(id => this.catalogTracks.find(t => t.id === id))
              .filter(Boolean)
          }));
        }
      } else {
        this.user = {
          id: authUser.id,
          email: authUser.email,
          displayName: fallbackName,
          avatarUrl: '',
          bio: ''
        };
        await this.syncUserDataToCloud();
      }
    },

    loadLocalProfile(email) {
      const raw = localStorage.getItem('nile_profile_' + email);
      if (!raw) return;
      const data = JSON.parse(raw);
      this.user = {
        id: data.id,
        email: data.email,
        displayName: data.displayName,
        avatarUrl: data.avatarUrl || '',
        bio: data.bio || ''
      };
      this.likedTracks = data.likedTracks || [];
      this.favoriteArtists = data.favoriteArtists || [];
      this.playlists = data.playlists || [];
    },

    async syncUserDataToCloud() {
      if (!this.user) return;

      if (supabaseClient) {
        const serializedPlaylists = this.playlists.map(pl => ({
          id: pl.id,
          name: pl.name,
          description: pl.description || '',
          trackIds: pl.tracks.map(t => t.id)
        }));

        await supabaseClient.from('profiles').upsert({
          id: this.user.id,
          display_name: this.user.displayName,
          avatar_url: this.user.avatarUrl || '',
          bio: this.user.bio || '',
          liked_track_ids: this.likedTracks.map(t => t.id),
          favorite_artists: this.favoriteArtists,
          playlists: serializedPlaylists,
          updated_at: new Date().toISOString()
        });
      } else {
        const payload = {
          id: this.user.id,
          email: this.user.email,
          displayName: this.user.displayName,
          avatarUrl: this.user.avatarUrl,
          bio: this.user.bio,
          likedTracks: this.likedTracks,
          favoriteArtists: this.favoriteArtists,
          playlists: this.playlists
        };
        localStorage.setItem('nile_profile_' + this.user.email, JSON.stringify(payload));
      }
    },

    // --- EDIÇÃO DE PERFIL E UPLOAD DE AVATAR ---
    openEditProfile() {
      if (!this.user) return;
      this.profileForm = {
        displayName: this.user.displayName || '',
        bio: this.user.bio || '',
        avatarUrl: this.user.avatarUrl || '',
        avatarFile: null,
        avatarPreview: ''
      };
      this.activeModal = 'editProfile';
    },

    onAvatarFileSelected(event) {
      const files = event.target && event.target.files;
      const file = files && files[0];
      if (!file) return;

      if (file.size > 3 * 1024 * 1024) {
        this.showToast('Escolha uma imagem menor que 3 MB.', 'error');
        return;
      }

      this.profileForm.avatarFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.profileForm.avatarPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    },

    async saveProfileChanges() {
      if (!this.user || !this.profileForm.displayName) return;
      this.profileSaving = true;

      try {
        let finalAvatarUrl = this.profileForm.avatarUrl;

        if (this.profileForm.avatarFile) {
          if (supabaseClient) {
            const fileExt = this.profileForm.avatarFile.name.split('.').pop();
            const filePath = this.user.id + '-' + Date.now() + '.' + fileExt;

            const uploadRes = await supabaseClient.storage
              .from('avatars')
              .upload(filePath, this.profileForm.avatarFile, { upsert: true });

            if (uploadRes.error) throw uploadRes.error;

            const pubRes = supabaseClient.storage
              .from('avatars')
              .getPublicUrl(filePath);

            finalAvatarUrl = pubRes.data.publicUrl;
          } else if (this.profileForm.avatarPreview) {
            finalAvatarUrl = this.profileForm.avatarPreview;
          }
        }

        this.user.displayName = this.profileForm.displayName.trim();
        this.user.bio = (this.profileForm.bio || '').trim();
        this.user.avatarUrl = finalAvatarUrl;

        await this.syncUserDataToCloud();
        this.showToast('Perfil atualizado com sucesso!');
        this.closeModal();
      } catch (err) {
        this.showToast('Erro ao salvar perfil: ' + (err.message || "verifique o bucket 'avatars'"), 'error');
      } finally {
        this.profileSaving = false;
      }
    },

    async logoutUser() {
      if (supabaseClient) {
        await supabaseClient.auth.signOut();
      } else {
        localStorage.removeItem('nile_active_email');
      }
      this.user = null;
      this.likedTracks = [];
      this.favoriteArtists = [];
      this.playlists = [
        { id: 'pl-1', name: 'Favoritas do Nilo', description: 'Seleção suave para relaxar', tracks: [] }
      ];
      this.showToast('Sua sessão foi encerrada.');
    },

    // --- UI HELPERS ---
    closeModal() {
      this.activeModal = null;
      this.trackToAdd = null;
      this.authPromptMessage = '';
    },

    showToast(message, type) {
      if (this.toastTimer) clearTimeout(this.toastTimer);
      this.toast = {
        visible: true,
        message: message,
        type: type || 'success'
      };
      this.toastTimer = setTimeout(() => {
        this.toast.visible = false;
      }, 3200);
    }
  }
}).mount('#app');
