import {
  type CampaignArchetype,
  type PlanetInventory,
  CAMPAIGNS,
  RESOURCE_PROPAGANDA_MATERIALS,
  stockOf,
} from '@smol/shared'
import { PanelFrame } from './PanelFrame'
import './play-shell.css'

interface CampaignPickerProps {
  readonly inventory: PlanetInventory
  readonly onSelect: (archetype: CampaignArchetype) => void
  readonly onClose: () => void
}

export function CampaignPicker({ inventory, onSelect, onClose }: CampaignPickerProps) {
  const propaganda = stockOf(inventory, RESOURCE_PROPAGANDA_MATERIALS)
  return (
    <PanelFrame
      panelId="campaign-picker"
      title="Propaganda Campaigns"
      emoji="📣"
      onClose={onClose}
      variant="centered"
      width={620}
      extraClass="campaign-picker"
    >
      <p className="campaign-picker__hint">
        Propaganda stockpile: <strong>{propaganda} 📜</strong> · Pick a campaign to launch.
      </p>
      <div className="campaign-picker__grid">
        {CAMPAIGNS.map((c) => {
          const cost = c.costs.reduce((sum, x) => sum + x.amount, 0)
          const affordable = propaganda >= cost
          return (
            <button
              key={c.archetype}
              type="button"
              className={`campaign-card ${affordable ? '' : 'campaign-card--unaffordable'}`}
              onClick={() => affordable && onSelect(c.archetype)}
              disabled={!affordable}
              title={c.description}
            >
              <span className="campaign-card__emoji" aria-hidden>
                {c.emoji}
              </span>
              <span className="campaign-card__name">{c.name}</span>
              <span className="campaign-card__cost">{cost} 📜</span>
              <span className="campaign-card__duration">{c.durationTicks}t duration</span>
              <span className="campaign-card__desc">{c.description}</span>
            </button>
          )
        })}
      </div>
    </PanelFrame>
  )
}
