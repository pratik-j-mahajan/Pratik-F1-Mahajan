/*
  Home background: an "aura" — soft fields of colour glowing out of a near-black
  backdrop, with the hottest one burning right behind the driver like engine heat.
  Each field is a pre-blurred radial gradient (no live blur filters), drifting and
  breathing slowly on transforms only, so it stays smooth. Fine grain and a few rings
  of heat haze finish it.
*/
export default function AuraBackdrop() {
  return (
    <div className="aura" aria-hidden="true">
      <span className="aura-field aura-core" />
      <span className="aura-field aura-flare" />
      <span className="aura-field aura-ember" />
      <span className="aura-field aura-cool" />
      <span className="aura-field aura-violet" />
      <span className="aura-halo" />
      <span className="aura-rings">
        <i />
        <i />
        <i />
      </span>
      <span className="aura-grain" />
      <span className="aura-vignette" />
    </div>
  )
}
