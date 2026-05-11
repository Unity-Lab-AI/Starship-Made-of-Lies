import { useEffect, useState } from 'react'
import { type AudioBusId } from '../../audio/AudioMixer'
import { type AudioSystem } from '../../audio/AudioSystem'
import { listSfxEventIds } from '../../audio/sfxManifest'
import { listIncompleteThemePacks, realAudioCoverageRatio } from '../../audio/themeAudioManifest'
import { LCDFrame } from './LCDFrame'
import './AudioSettingsPanel.css'

interface AudioSettingsPanelProps {
  readonly audioSystem: AudioSystem
}

const BUS_LABELS: Readonly<Record<AudioBusId, string>> = {
  master: 'Master',
  music: 'Music',
  sfx: 'SFX',
  voice: 'Voice',
}

const TEST_CUE_IDS = [
  'click',
  'build-complete',
  'launch-colony-ship',
  'achievement-unlocked',
] as const

export function AudioSettingsPanel({ audioSystem }: AudioSettingsPanelProps) {
  const [snapshot, setSnapshot] = useState(() => audioSystem.mixer.snapshot())
  const [coverage] = useState(() => Math.round(realAudioCoverageRatio() * 100))
  const [incomplete] = useState(() => listIncompleteThemePacks().length)

  useEffect(() => {
    setSnapshot(audioSystem.mixer.snapshot())
  }, [audioSystem])

  const onVolume = (bus: AudioBusId, value: number) => {
    audioSystem.setBusVolume(bus, value)
    setSnapshot(audioSystem.mixer.snapshot())
  }
  const onMute = (bus: AudioBusId, muted: boolean) => {
    audioSystem.setBusMuted(bus, muted)
    setSnapshot(audioSystem.mixer.snapshot())
  }
  const onGlobalMute = (muted: boolean) => {
    audioSystem.setGlobalMuted(muted)
    setSnapshot(audioSystem.mixer.snapshot())
  }
  const onPlayCue = (id: (typeof TEST_CUE_IDS)[number]) => {
    audioSystem.playSfx(id)
  }

  return (
    <LCDFrame
      title="🔊 Audio Settings"
      statusGlyph={snapshot.globalMuted ? '✕' : '◇'}
      statusLabel={snapshot.globalMuted ? 'muted' : `${coverage}% real audio`}
      variant={snapshot.globalMuted ? 'red' : 'green'}
    >
      <div className="audio-panel">
        <div className="audio-panel__buses">
          {snapshot.buses.map((bus) => (
            <div key={bus.id} className="audio-panel__bus">
              <label className="audio-panel__bus-label">{BUS_LABELS[bus.id]}</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={bus.volume}
                onChange={(e) => onVolume(bus.id, Number(e.target.value))}
                aria-label={`${BUS_LABELS[bus.id]} volume`}
              />
              <span className="audio-panel__bus-value">{Math.round(bus.volume * 100)}%</span>
              <button
                type="button"
                className={`audio-panel__bus-mute ${bus.muted ? 'audio-panel__bus-mute--on' : ''}`}
                onClick={() => onMute(bus.id, !bus.muted)}
                aria-pressed={bus.muted}
              >
                {bus.muted ? '✕' : '🔊'}
              </button>
            </div>
          ))}
        </div>
        <div className="audio-panel__global">
          <button
            type="button"
            className={`audio-panel__global-mute ${snapshot.globalMuted ? 'audio-panel__global-mute--on' : ''}`}
            onClick={() => onGlobalMute(!snapshot.globalMuted)}
          >
            {snapshot.globalMuted ? '🔇 Unmute All' : '🔇 Mute All'}
          </button>
        </div>
        <div className="audio-panel__cues">
          <span className="audio-panel__cues-label">Test cue:</span>
          {TEST_CUE_IDS.map((id) => (
            <button
              key={id}
              type="button"
              className="audio-panel__cue-btn"
              onClick={() => onPlayCue(id)}
            >
              {id} ▶
            </button>
          ))}
        </div>
        <div className="audio-panel__status">
          <p>
            <strong>Theme audio:</strong> {coverage}% real-recording coverage ({incomplete} themes
            on synth fallback).
          </p>
          <p className="audio-panel__hint">
            Real .ogg files are a binary-asset blocker. Synth fallback covers all themes today.
          </p>
          <p className="audio-panel__hint">{listSfxEventIds().length} SFX events registered.</p>
        </div>
      </div>
    </LCDFrame>
  )
}
