import { create } from 'zustand';
import type { Channel } from '@/types';
import { mockChannels } from '@/mock/data';

interface ChannelState {
  channels: Channel[];
  addChannel: (channel: Channel) => void;
  updateChannel: (id: string, data: Partial<Channel>) => void;
  toggleStatus: (id: string) => void;
  deleteChannel: (id: string) => void;
}

export const useChannels = create<ChannelState>((set) => ({
  channels: [...mockChannels],
  addChannel: (channel) =>
    set((state) => ({ channels: [...state.channels, channel] })),
  updateChannel: (id, data) =>
    set((state) => ({
      channels: state.channels.map((c) => (c.id === id ? { ...c, ...data } : c)),
    })),
  toggleStatus: (id) =>
    set((state) => ({
      channels: state.channels.map((c) =>
        c.id === id ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' } : c
      ),
    })),
  deleteChannel: (id) =>
    set((state) => ({
      channels: state.channels.filter((c) => c.id !== id),
    })),
}));
