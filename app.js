// =========================================================================
// CONFIGURAÇÃO DO SERVIDOR (COLE SUAS CHAVES DO SUPABASE ABAIXO)
// =========================================================================
const RAW_SUPABASE_URL = 'https://yqyytdvhcxfjkugjerme.supabase.co/rest/v1/';
const RAW_SUPABASE_ANON_KEY = 'sb_publishable_FZSVXEBEqr27PzRGq8ElSg_S4pfjPxD';
const CATALOG_JSON_URL = './musicas.json';

function normalizeSupabaseUrl(rawUrl) {
  const cleaned = (rawUrl || '').trim();
  if (!cleaned || cleaned.indexOf('COLE_SUA') !== -1) return '';

  const dashboardMatch = cleaned.match(/supabase\.com\/dashboard\/project\/([a-z0-9]+)/i);
  if (dashboardMatch && dashboardMatch[1]) {
    return 'https://' + dashboardMatch[1] + '.supabase.co';
  }

  try {
    const parsed = new URL(cleaned);
    return parsed.origin;
  } catch (e) {
    return cleaned.replace(/\/+$/, '');
  }
}

const SUPABASE_URL = normalizeSupabaseUrl(RAW_SUPABASE_URL);
const SUPABASE_ANON_KEY = (RAW_SUPABASE_ANON_KEY || '').trim();

const isSupabaseConfigured =
  SUPABASE_URL.indexOf('https://') === 0 &&
  SUPABASE_URL.indexOf('.supabase.co') !== -1 &&
  SUPABASE_ANON_KEY.indexOf('COLE_SUA') === -1 &&
  SUPABASE_ANON_KEY.length > 20;

let supabaseClient = null;
if (isSupabaseConfigured && window.supabase) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

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

function normalizeCatalogTracks(rawList) {
  const usedIds = new Set();

  return (rawList || [])
    .filter(t => t && t.url)
    .map((track, index) => {
      const rawTrackNum =
        track.id !== undefined && track.id !== null && String(track.id).trim() !== ''
          ? String(track.id).trim()
          : String(index + 1);

      const slugBase = [
        track.artist || 'artista',
        track.album || 'single',
        rawTrackNum,
        track.title || 'faixa'
      ]
        .join('__')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9_]+/g, '-')
        .replace(/^-+|-+$/g, '');

      let uniqueId = slugBase || 'track-' + (index + 1);
      if (usedIds.has(uniqueId)) {
        uniqueId = uniqueId + '__' + (index + 1);
      }
      usedIds.add(uniqueId);

      return {
        ...track,
        id: uniqueId,
        trackNumber: rawTrackNum
      };
    });
}

const { createApp } = Vue;

createApp({
  data() {
    return {
      isSupabaseConfigured: isSupabaseConfigured,
      currentView: 'home',
      sidebarOpen: false,
      isLoading: false,

      navHistory: [],
      navIndex: -1,
      isNavigatingHistory: false,

      user: null,
      authMode: 'login',
      authLoading: false,
      authPromptMessage: '',
      pendingAction: null,
      authForm: { displayName: '', email: '', password: '' },

      profileSaving: false,
      profileForm: {
        displayName: '',
        bio: '',
        avatarUrl: '',
        avatarFile: null,
        avatarPreview: ''
      },

      currentTrack: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 0.8,
      isMuted: false,
      isShuffle: false,
      isRepeat: false,
      playQueue: [],
      originalQueue: [],
      queueDrawerOpen: false,

      catalogTracks: [],
      searchResults: [],
      likedTracks: [],
      favoriteArtists: [],
      playlists: [
        { id: 'pl-1', name: 'Favoritas do Nilo', description: 'Seleção suave para relaxar', tracks: [] }
      ],

      artistData: null,
      albumData: null,

      searchQuery: '',
      searchFilterTab: 'all',

      activeModal: null,
      trackToAdd: null,
      activePlaylistId: null,

      newPlaylistForm: { name: '', description: '' },
      toast: { visible: false, message: '', type: 'success' },
      toastTimer: null
    };
  },

  async mounted() {
    if (this.$refs.audioRef) {
      this.$refs.audioRef.volume = this.volume;
    }

    this.recordHistory({ view: 'home' });
    await this.loadServerCatalog();
    await this.restoreUserSession();

    if (supabaseClient && supabaseClient.auth && supabaseClient.auth.onAuthStateChange) {
      supabaseClient.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session && session.user && (!this.user || this.user.id !== session.user.id)) {
          await this.loadSupabaseProfile(session.user);
        } else if (event === 'SIGNED_OUT') {
          this.user = null;
        }
      });
    }
  },

  computed: {
    canGoBack() {
      return this.navIndex > 0;
    },

    canGoForward() {
      return this.navIndex < this.navHistory.length - 1;
    },

    popularArtists() {
      const map = new Map();
      (this.catalogTracks || []).forEach(track => {
        if (!track.artist) return;
        const key = track.artist.trim().toLowerCase();
        if (!map.has(key)) {
          map.set(key, {
            name: track.artist.trim(),
            genre: track.genre || 'Música',
            image: track.artistImage || track.cover || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80'
          });
        }
      });
      return Array.from(map.values()).sort((a, b) =>
        a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })
      );
    },

    catalogAlbums() {
      const map = new Map();
      (this.catalogTracks || []).forEach(track => {
        const albumName = (track.album || 'Single').trim();
        const artistName = (track.artist || 'Artista').trim();
        const key = artistName.toLowerCase() + '::' + albumName.toLowerCase();
        if (!map.has(key)) {
          map.set(key, {
            name: albumName,
            artist: artistName,
            genre: track.genre || 'Música',
            cover: track.cover || track.artistImage || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80',
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
      return this.popularArtists.filter(
        a => a.name.toLowerCase().indexOf(q) !== -1 || (a.genre && a.genre.toLowerCase().indexOf(q) !== -1)
      );
    },

    matchedAlbums() {
      const q = (this.searchQuery || '').trim().toLowerCase();
      if (!q) return this.catalogAlbums;
      return this.catalogAlbums.filter(
        alb =>
          alb.name.toLowerCase().indexOf(q) !== -1 ||
          alb.artist.toLowerCase().indexOf(q) !== -1 ||
          (alb.genre && alb.genre.toLowerCase().indexOf(q) !== -1)
      );
    },

    artistAlbums() {
      if (!this.artistData || !Array.isArray(this.artistData.tracks)) return [];
      const map = new Map();
      this.artistData.tracks.forEach(track => {
        const albumName = (track.album || 'Single').trim();
        const key = albumName.toLowerCase();
        if (!map.has(key)) {
          map.set(key, {
            name: albumName,
            artist: this.artistData.name,
            genre: track.genre || this.artistData.genre || 'Música',
            cover: track.cover || this.artistData.image,
            tracks: []
          });
        }
        map.get(key).tracks.push(track);
      });
      return Array.from(map.values());
    },

    activePlaylist() {
      if (!this.activePlaylistId) return null;
      return this.playlists.find(p => p.id === this.activePlaylistId) || null;
    }
  },

  methods: {
    recordHistory(entry) {
      if (this.isNavigatingHistory) return;

      const current = this.navHistory[this.navIndex];
      if (
        current &&
        current.view === entry.view &&
        (current.artistName || '') === (entry.artistName || '') &&
        (current.albumKey || '') === (entry.albumKey || '') &&
        (current.playlistId || '') === (entry.playlistId || '')
      ) {
        if (entry.view === 'search') {
          current.searchQuery = entry.searchQuery || '';
        }
        return;
      }

      if (this.navIndex < this.navHistory.length - 1) {
        this.navHistory = this.navHistory.slice(0, this.navIndex + 1);
      }

      this.navHistory.push({
        view: entry.view,
        artistName: entry.artistName || null,
        albumKey: entry.albumKey || null,
        albumSnapshot: entry.albumSnapshot || null,
        playlistId: entry.playlistId || null,
        searchQuery: entry.searchQuery || ''
      });
      this.navIndex = this.navHistory.length - 1;
    },

    goBack() {
      if (!this.canGoBack) return;
      this.navIndex -= 1;
      this.restoreHistoryEntry(this.navHistory[this.navIndex]);
    },

    goForward() {
      if (!this.canGoForward) return;
      this.navIndex += 1;
      this.restoreHistoryEntry(this.navHistory[this.navIndex]);
    },

    restoreHistoryEntry(entry) {
      if (!entry) return;
      this.isNavigatingHistory = true;
      try {
        if (entry.view === 'artist' && entry.artistName) {
          this.openArtistPage(entry.artistName);
        } else if (entry.view === 'album') {
          const foundAlbum = this.catalogAlbums.find(
            a => (a.artist.toLowerCase() + '::' + a.name.toLowerCase()) === entry.albumKey
          );
          if (foundAlbum) {
            this.openAlbumPage(foundAlbum);
          } else if (entry.albumSnapshot) {
            this.openAlbumPage(entry.albumSnapshot);
          } else {
            this.currentView = 'search';
          }
        } else if (entry.view === 'playlist' && entry.playlistId) {
          const pl = this.playlists.find(p => p.id === entry.playlistId);
          if (pl) {
            this.openPlaylist(pl);
          } else {
            this.currentView = 'library';
          }
        } else if (entry.view === 'search') {
          this.searchQuery = entry.searchQuery || '';
          this.searchCatalog();
          this.currentView = 'search';
        } else {
          this.currentView = entry.view || 'home';
        }
        this.sidebarOpen = false;
      } finally {
        this.isNavigatingHistory = false;
      }
    },

    navigate(view) {
      this.currentView = view;
      this.sidebarOpen = false;
      if (view === 'search') {
        this.searchCatalog();
      }
      this.recordHistory({
        view: view,
        searchQuery: view === 'search' ? this.searchQuery : ''
      });
    },

    async loadServerCatalog() {
      this.isLoading = true;
      try {
        const response = await fetch(CATALOG_JSON_URL, { cache: 'no-store' });
        if (!response.ok) throw new Error('Arquivo JSON não encontrado');
        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
          this.catalogTracks = normalizeCatalogTracks(data);
        } else {
          this.catalogTracks = normalizeCatalogTracks(FALLBACK_CATALOG);
        }
      } catch (err) {
        this.catalogTracks = normalizeCatalogTracks(FALLBACK_CATALOG);
      } finally {
        this.searchResults = this.catalogTracks.slice();
        this.isLoading = false;
      }
    },

    searchCatalog() {
      const q = (this.searchQuery || '').trim().toLowerCase();

      if (this.currentView === 'search' && this.navHistory[this.navIndex] && this.navHistory[this.navIndex].view === 'search') {
        this.navHistory[this.navIndex].searchQuery = this.searchQuery || '';
      }

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
      this.recordHistory({
        view: 'artist',
        artistName: artistName
      });
    },

    openAlbumPage(album) {
      this.albumData = album;
      this.currentView = 'album';
      this.sidebarOpen = false;
      const albumKey = (album.artist || '').toLowerCase() + '::' + (album.name || '').toLowerCase();
      this.recordHistory({
        view: 'album',
        albumKey: albumKey,
        albumSnapshot: album
      });
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
      this.recordHistory({
        view: 'playlist',
        playlistId: p.id
      });
    },

    sortTracksById(tracks) {
      return (tracks || []).slice().sort((a, b) => {
        const numA = String(a && a.trackNumber !== undefined ? a.trackNumber : (a && a.id !== undefined ? a.id : ''));
        const numB = String(b && b.trackNumber !== undefined ? b.trackNumber : (b && b.id !== undefined ? b.id : ''));
        return numA.localeCompare(numB, undefined, { numeric: true, sensitivity: 'base' });
      });
    },

    playAlbum(albumTracks) {
      if (!albumTracks || albumTracks.length === 0) return;
      const ordered = this.sortTracksById(albumTracks);
      this.playTrack(ordered[0], ordered);
    },

    shuffleArray(items) {
      const arr = (items || []).slice();
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
      }
      return arr;
    },

    applyShuffleToQueue(firstTrack = null) {
      if (!Array.isArray(this.playQueue) || this.playQueue.length <= 1) return;

      const anchorTrack = firstTrack || this.currentTrack;
      if (anchorTrack && this.playQueue.some(t => t.id === anchorTrack.id)) {
        const others = this.playQueue.filter(t => t.id !== anchorTrack.id);
        let shuffledOthers = this.shuffleArray(others);

        if (others.length > 1) {
          const sameOrder = shuffledOthers.every((t, idx) => t.id === others[idx].id);
          if (sameOrder) {
            shuffledOthers = others.slice(1).concat(others[0]);
          }
        }

        this.playQueue = [anchorTrack].concat(shuffledOthers);
      } else {
        const before = this.playQueue.slice();
        let shuffled = this.shuffleArray(before);
        if (before.length > 1 && shuffled.every((t, idx) => t.id === before[idx].id)) {
          shuffled = before.slice(1).concat(before[0]);
        }
        this.playQueue = shuffled;
      }
    },

    toggleShuffle() {
      this.isShuffle = !this.isShuffle;

      if (this.isShuffle) {
        this.originalQueue = this.playQueue.slice();
        this.applyShuffleToQueue(this.currentTrack);
        this.showToast('Modo aleatório ativado: fila de execução embaralhada.');
      } else {
        if (this.originalQueue.length > 0) {
          const activeIds = new Set(this.playQueue.map(t => t.id));
          const restored = this.originalQueue.filter(t => activeIds.has(t.id));
          const extras = this.playQueue.filter(
            t => !restored.some(r => r.id === t.id)
          );
          this.playQueue = restored.concat(extras);
          this.originalQueue = [];
        }
        this.showToast('Modo aleatório desativado: ordem original restaurada.');
      }
    },

    addToQueue(track) {
      if (!track || !track.url) {
        this.showToast('Prévia de áudio indisponível para esta faixa.', 'error');
        return;
      }

      if (this.currentTrack && !this.playQueue.some(t => t.id === this.currentTrack.id)) {
        this.playQueue.unshift(this.currentTrack);
      }

      if (this.currentTrack && this.currentTrack.id === track.id) {
        this.showToast('Esta música já está tocando agora.');
        return;
      }

      if (this.playQueue.some(t => t.id === track.id)) {
        this.showToast('"' + track.title + '" já está na fila de execução.');
        return;
      }

      this.playQueue.push(track);
      if (this.isShuffle) {
        this.originalQueue.push(track);
      }

      if (!this.currentTrack) {
        this.playTrack(track, null, true);
      }

      this.showToast('"' + track.title + '" adicionada à fila de execução!');
    },

    playFromQueue(track) {
      this.playTrack(track, null, true);
    },

    removeFromQueue(index) {
      if (index < 0 || index >= this.playQueue.length) return;
      const removed = this.playQueue.splice(index, 1)[0];
      if (removed) {
        if (this.originalQueue.length > 0) {
          this.originalQueue = this.originalQueue.filter(t => t.id !== removed.id);
        }
        this.showToast('"' + removed.title + '" removida da fila.');
      }
    },

    clearQueue() {
      this.playQueue = this.currentTrack ? [this.currentTrack] : [];
      this.originalQueue = this.playQueue.slice();
      this.showToast('Fila de execução limpa.');
    },

    playTrack(track, contextTracks = null, keepQueue = false) {
      if (!track || !track.url) {
        this.showToast('Prévia de áudio indisponível para esta faixa.', 'error');
        return;
      }

      if (Array.isArray(contextTracks) && contextTracks.length > 0) {
        const ordered = this.sortTracksById(contextTracks);
        this.originalQueue = ordered.slice();
        this.playQueue = ordered;
        if (this.isShuffle) {
          this.applyShuffleToQueue(track);
        }
      } else if (!keepQueue) {
        const existsInQueue = this.playQueue.some(t => t.id === track.id);
        if (!existsInQueue) {
          this.playQueue = [track];
          this.originalQueue = [track];
        }
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
      this.originalQueue = list.slice();
      this.playQueue = list.slice();
      if (this.isShuffle) {
        this.applyShuffleToQueue();
      }
      this.playTrack(this.playQueue[0], null, true);
    },

    playRandomTrack() {
      if (!this.catalogTracks || this.catalogTracks.length === 0) {
        this.showToast('Nenhuma música disponível no catálogo.', 'error');
        return;
      }

      let pool = this.catalogTracks;
      if (this.currentTrack && this.catalogTracks.length > 1) {
        pool = this.catalogTracks.filter(t => t.id !== this.currentTrack.id);
      }

      const randomIndex = Math.floor(Math.random() * pool.length);
      const chosen = pool[randomIndex];
      this.playTrack(chosen);
      this.showToast('Explorando: "' + chosen.title + '" — ' + chosen.artist);
    },

    togglePlay() {
      const player = this.$refs.audioRef;
      if (!this.currentTrack) {
        if (this.playQueue.length > 0) {
          this.playTrack(this.playQueue[0], null, true);
        } else if (this.catalogTracks.length > 0) {
          this.playTrack(this.catalogTracks[0]);
        }
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
      if (!this.currentTrack) return;
      const queue = this.playQueue.length > 0 ? this.playQueue : this.catalogTracks;
      if (queue.length === 0) return;

      if (this.currentTime > 3) {
        this.seekAudio(0);
        return;
      }

      const idx = queue.findIndex(t => t.id === this.currentTrack.id);
      const prevIdx = idx === -1 ? 0 : (idx - 1 + queue.length) % queue.length;
      this.playTrack(queue[prevIdx], null, true);
    },

    nextTrack() {
      if (!this.currentTrack) return;
      const queue = this.playQueue.length > 0 ? this.playQueue : this.catalogTracks;
      if (queue.length === 0) return;

      const idx = queue.findIndex(t => t.id === this.currentTrack.id);
      const nextIdx = idx === -1 ? 0 : (idx + 1) % queue.length;
      this.playTrack(queue[nextIdx], null, true);
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

    async executePendingAction() {
      if (!this.pendingAction || !this.user) return;
      const action = this.pendingAction;
      this.pendingAction = null;

      if (action.type === 'likeTrack' && action.payload) {
        if (!this.isTrackLiked(action.payload.id)) {
          this.likedTracks.push(action.payload);
          const saved = await this.syncUserDataToCloud();
          if (saved) {
            this.showToast('"' + action.payload.title + '" salva nos favoritos!');
          }
        }
      } else if (action.type === 'favoriteArtist' && action.payload) {
        if (!this.isArtistFavorited(action.payload.name)) {
          this.favoriteArtists.push(action.payload);
          const saved = await this.syncUserDataToCloud();
          if (saved) {
            this.showToast('"' + action.payload.name + '" adicionado aos artistas favoritos!');
          }
        }
      } else if (action.type === 'createPlaylist') {
        this.activeModal = 'createPlaylist';
      } else if (action.type === 'addToPlaylist' && action.payload) {
        this.trackToAdd = action.payload;
        this.activeModal = 'addToPlaylist';
      }
    },

    isTrackLiked(trackId) {
      if (!this.user || trackId === undefined || trackId === null) return false;
      const targetId = String(trackId);
      return this.likedTracks.some(t => String(t.id) === targetId);
    },

    async toggleLikeTrack(track) {
      if (!this.requireAuth(
        'Entre na sua conta para salvar "' + track.title + '" nos seus favoritos!',
        { type: 'likeTrack', payload: track }
      )) {
        return;
      }

      const targetId = String(track.id);
      const idx = this.likedTracks.findIndex(t => String(t.id) === targetId);
      if (idx > -1) {
        this.likedTracks.splice(idx, 1);
        const saved = await this.syncUserDataToCloud();
        if (saved) {
          this.showToast('"' + track.title + '" removida dos favoritos.');
        }
      } else {
        this.likedTracks.push(track);
        const saved = await this.syncUserDataToCloud();
        if (saved) {
          this.showToast('"' + track.title + '" salva nos favoritos!');
        }
      }
    },

    isArtistFavorited(artistName) {
      if (!this.user) return false;
      return this.favoriteArtists.some(a => a.name.toLowerCase() === artistName.toLowerCase());
    },

    async toggleFavoriteArtist(artist) {
      if (!this.requireAuth(
        'Entre na sua conta para favoritar "' + artist.name + '"!',
        { type: 'favoriteArtist', payload: artist }
      )) {
        return;
      }

      const idx = this.favoriteArtists.findIndex(a => a.name.toLowerCase() === artist.name.toLowerCase());
      if (idx > -1) {
        this.favoriteArtists.splice(idx, 1);
        const saved = await this.syncUserDataToCloud();
        if (saved) {
          this.showToast('"' + artist.name + '" removido dos favoritos.');
        }
      } else {
        this.favoriteArtists.push(artist);
        const saved = await this.syncUserDataToCloud();
        if (saved) {
          this.showToast('"' + artist.name + '" adicionado aos artistas favoritos!');
        }
      }
    },

    handleOpenCreatePlaylist() {
      if (!this.requireAuth('Faça login para criar suas próprias playlists!', { type: 'createPlaylist' })) {
        return;
      }
      this.activeModal = 'createPlaylist';
    },

    async createPlaylist() {
      if (!this.requireAuth('Faça login para criar uma playlist!')) return;
      if (!this.newPlaylistForm.name) return;

      const pl = {
        id: 'pl-' + Date.now(),
        name: this.newPlaylistForm.name.trim(),
        description: (this.newPlaylistForm.description || '').trim(),
        tracks: []
      };

      this.playlists.push(pl);
      this.newPlaylistForm = { name: '', description: '' };
      this.closeModal();

      const saved = await this.syncUserDataToCloud();
      if (saved) {
        this.showToast('Playlist "' + pl.name + '" criada!');
      }
    },

    openAddToPlaylistModal(track) {
      if (!this.requireAuth('Faça login para adicionar músicas às suas playlists!', { type: 'addToPlaylist', payload: track })) {
        return;
      }
      this.trackToAdd = track;
      this.activeModal = 'addToPlaylist';
    },

    async addTrackToPlaylist(playlistId, track) {
      const pl = this.playlists.find(p => p.id === playlistId);
      if (pl) {
        const targetId = String(track.id);
        if (!pl.tracks.some(t => String(t.id) === targetId)) {
          pl.tracks.push(track);
          const saved = await this.syncUserDataToCloud();
          if (saved) {
            this.showToast('Música adicionada à playlist "' + pl.name + '"');
          }
        } else {
          this.showToast('Esta música já está na playlist.');
        }
      }
      this.closeModal();
    },

    async removeFromPlaylist(playlistId, trackId) {
      const pl = this.playlists.find(p => p.id === playlistId);
      if (pl) {
        const targetId = String(trackId);
        pl.tracks = pl.tracks.filter(t => String(t.id) !== targetId);
        const saved = await this.syncUserDataToCloud();
        if (saved) {
          this.showToast('Música removida da playlist.');
        }
      }
    },

    async deletePlaylist(playlistId) {
      this.playlists = this.playlists.filter(p => p.id !== playlistId);
      this.navigate('library');
      const saved = await this.syncUserDataToCloud();
      if (saved) {
        this.showToast('Playlist excluída.');
      }
    },

    serializePlaylists() {
      return (this.playlists || []).map(pl => ({
        id: pl.id,
        name: pl.name,
        description: pl.description || '',
        trackIds: (pl.tracks || []).map(t => String(t.id)),
        tracks: (pl.tracks || []).map(t => ({
          id: String(t.id),
          trackNumber: t.trackNumber || '',
          title: t.title,
          artist: t.artist,
          artistImage: t.artistImage || '',
          album: t.album || '',
          genre: t.genre || '',
          cover: t.cover || '',
          url: t.url || ''
        }))
      }));
    },

    hydratePlaylists(rawPlaylists) {
      let parsed = rawPlaylists;
      if (typeof parsed === 'string') {
        try {
          parsed = JSON.parse(parsed);
        } catch (e) {
          parsed = [];
        }
      }
      if (!Array.isArray(parsed)) return [];

      return parsed.map(pl => {
        const fallbackTracks = Array.isArray(pl.tracks) ? pl.tracks : [];
        const rawIds = Array.isArray(pl.trackIds)
          ? pl.trackIds
          : fallbackTracks.map(item => (typeof item === 'object' && item !== null ? item.id : item));

        const resolvedTracks = rawIds
          .map(rawId => {
            const targetId = String(rawId);
            const fromCatalog = this.catalogTracks.find(t => String(t.id) === targetId);
            if (fromCatalog) return fromCatalog;

            const fromSnapshot = fallbackTracks.find(
              t => typeof t === 'object' && t !== null && String(t.id) === targetId
            );
            return fromSnapshot || null;
          })
          .filter(Boolean);

        return {
          id: pl.id || 'pl-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
          name: pl.name || 'Playlist sem nome',
          description: pl.description || '',
          tracks: resolvedTracks
        };
      });
    },

    hydrateLikedTracks(rawLikedIds, fallbackLikedTracks = []) {
      let parsedIds = rawLikedIds;
      if (typeof parsedIds === 'string') {
        try {
          parsedIds = JSON.parse(parsedIds);
        } catch (e) {
          parsedIds = [];
        }
      }
      if (!Array.isArray(parsedIds)) return [];

      return parsedIds
        .map(rawId => {
          const idValue = typeof rawId === 'object' && rawId !== null ? rawId.id : rawId;
          const targetId = String(idValue);
          const fromCatalog = this.catalogTracks.find(t => String(t.id) === targetId);
          if (fromCatalog) return fromCatalog;

          const fromFallback = (fallbackLikedTracks || []).find(t => String(t.id) === targetId);
          return fromFallback || (typeof rawId === 'object' && rawId !== null ? rawId : null);
        })
        .filter(Boolean);
    },

    async restoreUserSession() {
      if (supabaseClient) {
        try {
          const res = await supabaseClient.auth.getSession();
          const sessionUser = res && res.data && res.data.session && res.data.session.user;
          if (sessionUser) {
            await this.loadSupabaseProfile(sessionUser);
          }
        } catch (err) {
          console.warn('Falha ao restaurar sessão Supabase:', err);
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
              email: this.authForm.email.trim(),
              password: this.authForm.password,
              options: { data: { display_name: displayName } }
            });

            if (res.error) throw res.error;

            if (res.data && res.data.user) {
              if (!res.data.session) {
                this.showToast('Conta criada! Confirme seu e-mail (ou desative "Confirm email" no Supabase) antes de entrar.', 'error');
                this.authMode = 'login';
                return;
              }

              const { error: profileError } = await supabaseClient.from('profiles').upsert({
                id: res.data.user.id,
                display_name: displayName,
                avatar_url: '',
                bio: '',
                liked_track_ids: [],
                favorite_artists: [],
                playlists: this.serializePlaylists()
              });

              if (profileError) {
                console.error('Erro ao criar registro em profiles:', profileError);
              }

              await this.loadSupabaseProfile(res.data.user);
              this.showToast('Conta criada! Bem-vindo ao Nile, ' + displayName + '!');
              this.closeModal();
              await this.executePendingAction();
            }
          } else {
            const res = await supabaseClient.auth.signInWithPassword({
              email: this.authForm.email.trim(),
              password: this.authForm.password
            });

            if (res.error) throw res.error;

            if (res.data && res.data.user) {
              await this.loadSupabaseProfile(res.data.user);
              this.showToast('Bem-vindo de volta, ' + this.user.displayName + '!');
              this.closeModal();
              await this.executePendingAction();
            }
          }
        } else {
          const email = this.authForm.email.trim().toLowerCase();
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
          await this.executePendingAction();
        }

        this.authForm = { displayName: '', email: '', password: '' };
        this.authPromptMessage = '';
      } catch (err) {
        const msg = err && err.message ? err.message : 'Falha na autenticação.';
        if (msg.toLowerCase().indexOf('invalid path') !== -1) {
          this.showToast('URL do Supabase inválida. Use apenas https://seu-projeto.supabase.co no app.js.', 'error');
        } else {
          this.showToast('Erro: ' + msg, 'error');
        }
      } finally {
        this.authLoading = false;
      }
    },

    async loadSupabaseProfile(authUser) {
      if (!this.catalogTracks || this.catalogTracks.length === 0) {
        await this.loadServerCatalog();
      }

      const { data: profile, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (error) {
        console.error('Erro ao carregar perfil do Supabase:', error);
        if (error.message && error.message.toLowerCase().indexOf('permission denied') !== -1) {
          this.showToast('Permissão negada na tabela profiles. Rode o SQL de permissões (GRANT e RLS) no Supabase.', 'error');
        } else {
          this.showToast('Erro ao carregar seus dados: ' + error.message, 'error');
        }
      }

      const metaName = authUser.user_metadata && authUser.user_metadata.display_name;
      const fallbackName = metaName || authUser.email.split('@')[0];

      let localBackup = null;
      try {
        const rawBackup = localStorage.getItem('nile_backup_' + authUser.id);
        if (rawBackup) localBackup = JSON.parse(rawBackup);
      } catch (e) {}

      if (profile) {
        this.user = {
          id: authUser.id,
          email: authUser.email,
          displayName: profile.display_name || fallbackName,
          avatarUrl: profile.avatar_url || '',
          bio: profile.bio || ''
        };

        this.likedTracks = this.hydrateLikedTracks(
          profile.liked_track_ids,
          localBackup ? localBackup.likedTracks : []
        );

        this.favoriteArtists = Array.isArray(profile.favorite_artists) ? profile.favorite_artists : [];

        if (profile.playlists !== null && profile.playlists !== undefined) {
          this.playlists = this.hydratePlaylists(profile.playlists);
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
      const savedLiked = data.likedTracks || [];
      this.likedTracks = this.hydrateLikedTracks(
        savedLiked.map(t => t.id),
        savedLiked
      );
      this.favoriteArtists = data.favoriteArtists || [];
      this.playlists = this.hydratePlaylists(data.playlists || []);
    },

    async syncUserDataToCloud() {
      if (!this.user) return false;

      if (supabaseClient) {
        const { data: sessionData } = await supabaseClient.auth.getSession();
        const activeSession = sessionData && sessionData.session;
        if (!activeSession || !activeSession.user) {
          this.showToast('Sua sessão expirou. Faça login novamente para salvar.', 'error');
          this.user = null;
          this.openAuthModal('Sua sessão expirou. Entre novamente para salvar seus favoritos!');
          return false;
        }

        const serializedPlaylists = this.serializePlaylists();
        const likedIds = this.likedTracks.map(t => String(t.id));

        try {
          localStorage.setItem(
            'nile_backup_' + this.user.id,
            JSON.stringify({
              likedTracks: this.likedTracks,
              favoriteArtists: this.favoriteArtists,
              playlists: this.playlists
            })
          );
        } catch (e) {}

        const { error } = await supabaseClient
          .from('profiles')
          .upsert(
            {
              id: activeSession.user.id,
              display_name: this.user.displayName,
              avatar_url: this.user.avatarUrl || '',
              bio: this.user.bio || '',
              liked_track_ids: likedIds,
              favorite_artists: this.favoriteArtists,
              playlists: serializedPlaylists,
              updated_at: new Date().toISOString()
            },
            { onConflict: 'id' }
          );

        if (error) {
          console.error('Erro ao salvar dados do usuário no Supabase:', error);
          if (error.message && error.message.toLowerCase().indexOf('permission denied') !== -1) {
            this.showToast('Permissão negada na tabela profiles. Rode o SQL de permissões (GRANT e RLS) no SQL Editor do Supabase.', 'error');
          } else {
            this.showToast('Erro ao salvar no servidor: ' + error.message, 'error');
          }
          return false;
        }
        return true;
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
        return true;
      }
    },

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
      this.closeModal();
      this.showToast('Sua sessão foi encerrada.');
    },

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

window.__NILE_MOUNTED__ = true;
