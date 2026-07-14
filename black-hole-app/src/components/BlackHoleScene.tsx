import { useEffect, useRef } from 'react'
import {
  Application,
  Container,
  FederatedPointerEvent,
  Filter,
  GlProgram,
  Graphics,
  Rectangle,
} from 'pixi.js'
import { GAME, MASS_UNIT_KG } from '../game/constants'
import { deriveSimulation } from '../game/model'
import { useGameStore } from '../game/store'

type OrbitalParticle = {
  view: Graphics
  angle: number
  radiusFactor: number
  speedFactor: number
  phase: number
  rock: boolean
}

type FeedParticle = {
  view: Graphics
  angle: number
  radius: number
  duration: number
  age: number
  rotations: number
}

type JetParticle = {
  view: Graphics
  xOffset: number
  y: number
  velocity: number
  life: number
  maxLife: number
  direction: -1 | 1
}

type FeedPoint = { x: number; y: number }

type BlackHoleUniforms = {
  uTime: number
  uAspect: number
  uCoreRadius: number
  uDiskProgress: number
  uDiskLoad: number
  uRotation: number
  uHeat: number
  uSpin: number
}

const randomRange = (min: number, max: number) => min + Math.random() * (max - min)
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const FILTER_VERTEX = `
in vec2 aPosition;
out vec2 vTextureCoord;
uniform vec4 uInputSize;
uniform vec4 uOutputFrame;
uniform vec4 uOutputTexture;
vec4 filterVertexPosition(void){
  vec2 position=aPosition*uOutputFrame.zw+uOutputFrame.xy;
  position.x=position.x*(2.0/uOutputTexture.x)-1.0;
  position.y=position.y*(2.0*uOutputTexture.z/uOutputTexture.y)-uOutputTexture.z;
  return vec4(position,0.0,1.0);
}
vec2 filterTextureCoord(void){return aPosition*(uOutputFrame.zw*uInputSize.zw);}
void main(void){gl_Position=filterVertexPosition();vTextureCoord=filterTextureCoord();}
`

const LENSING_FRAGMENT = `
precision highp float;
in vec2 vTextureCoord;
uniform sampler2D uTexture;
uniform float uAspect;
uniform float uCoreRadius;
uniform float uSpin;
uniform float uTime;
void main(void){
  vec2 centered=vTextureCoord-0.5;
  centered.x*=uAspect;
  float radius=max(length(centered),0.0008);
  vec2 direction=centered/radius;
  vec2 tangent=vec2(-direction.y,direction.x);
  float influence=1.0-smoothstep(uCoreRadius*1.15,uCoreRadius*7.5,radius);
  float deflection=influence*uCoreRadius*uCoreRadius*0.85/(radius+uCoreRadius*0.4);
  float frameDrag=influence*uSpin*uCoreRadius*0.42/(radius+0.02);
  vec2 warped=centered+direction*deflection+tangent*frameDrag;
  warped.x/=uAspect;
  vec4 color=texture2D(uTexture,warped+0.5);
  float ring=exp(-pow((radius-uCoreRadius*1.72)/max(uCoreRadius*0.18,0.0014),2.0));
  float arc=exp(-pow((radius-uCoreRadius*3.1)/max(uCoreRadius*0.48,0.003),2.0));
  color.rgb+=vec3(0.34,0.45,0.72)*ring*0.42*(0.92+0.08*sin(uTime*0.7));
  color.rgb+=vec3(0.17,0.12,0.33)*arc*0.18;
  gl_FragColor=color;
}
`

const DISK_FRAGMENT = `
precision highp float;
in vec2 vTextureCoord;
uniform sampler2D uTexture;
uniform float uTime;
uniform float uAspect;
uniform float uCoreRadius;
uniform float uDiskProgress;
uniform float uDiskLoad;
uniform float uRotation;
uniform float uHeat;
uniform float uSpin;
float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;mat2 r=mat2(.8,-.6,.6,.8);for(int i=0;i<5;i++){v+=a*noise(p);p=r*p*2.03+17.1;a*=.5;}return v;}
float gauss(float v,float w){return exp(-v*v/max(w*w,.000001));}
void main(void){
  vec2 p=vTextureCoord-.5;p.x*=uAspect;
  float tilt=mix(.48,.30,clamp(uSpin,0.,1.));
  vec2 q=vec2(p.x,p.y/tilt);
  float radius=length(q),angle=atan(q.y,q.x);
  float inner=uCoreRadius*2.15;
  float outer=mix(inner*2.4,.43,smoothstep(.02,1.,uDiskProgress));
  outer*=1.+min(uDiskLoad,2.)*.055;
  float width=max(outer-inner,.012);
  float nr=clamp((radius-inner)/width,0.,1.);
  float band=smoothstep(inner,inner+width*.10,radius)*(1.-smoothstep(outer-width*.08,outer,radius));
  float time=uTime*(.18+uRotation*.11);
  float turb=fbm(q*19.+vec2(time*.17,-time*.11));
  float fine=fbm(q*47.+vec2(-time*.31,time*.24));
  float phase=angle*3.-log(max(radius,.002))*10.5-time*2.1;
  float arm=pow(clamp(.5+.5*sin(phase+turb*5.6),0.,1.),7.5);
  float arm2=pow(.5+.5*sin(phase*1.67+fine*4.+2.1),12.);
  float threshold=mix(1.16,.54,smoothstep(0.,.62,uDiskProgress));
  float sparse=smoothstep(threshold,threshold+.22,arm*.86+arm2*.45+turb*.60);
  float dense=smoothstep(.38,.92,uDiskProgress)*(.18+turb*.58+arm*.65);
  float rings=smoothstep(-.15,.95,.46+.54*sin(nr*72.-time*2.6+turb*10.));
  float clumps=smoothstep(.56,.93,fine+arm*.52);
  float matter=band*(sparse+dense*rings+clumps*uDiskProgress*.34);
  float innerHeat=gauss(radius-inner*1.18,max(uCoreRadius*.54,.006));
  float shock=gauss(radius-mix(inner*1.4,outer*.86,.55),width*.055)*smoothstep(.22,.86,arm+turb*.32);
  float front=mix(.48,1.,smoothstep(-.15,.72,sin(angle)));
  vec3 ember=vec3(.95,.19,.035),gold=vec3(1.,.57,.16),whiteHot=vec3(1.,.91,.72),blue=vec3(.78,.90,1.);
  vec3 hot=mix(ember,gold,clamp(uHeat*1.15,0.,1.));
  hot=mix(hot,whiteHot,clamp((uHeat-.35)*1.4+innerHeat*.42,0.,1.));
  hot=mix(hot,blue,clamp((uHeat-.77)*3.+innerHeat*.18,0.,.58));
  float alpha=matter*front*(1.+innerHeat*2.4+shock*1.7)*smoothstep(.003,.06,uDiskProgress);
  alpha*=.48+min(uDiskLoad,1.8)*.24;
  float photon=gauss(radius-uCoreRadius*1.26,max(uCoreRadius*.095,.0017))*(.12+smoothstep(.05,.45,uDiskProgress)*.78);
  float returning=gauss(radius-uCoreRadius*1.72,max(uCoreRadius*.19,.0024))*matter*.36;
  vec3 color=hot*alpha*(1.+innerHeat*1.5+shock*1.1)+whiteHot*photon*(.55+uHeat*.55)+vec3(.33,.19,.52)*returning;
  gl_FragColor=vec4(color,clamp(alpha*.82+photon*.72+returning,0.,1.));
}
`

function makeRock(size: number) {
  const view = new Graphics()
  const points: number[] = []
  for (let i = 0; i < 6; i += 1) {
    const angle = (i / 6) * Math.PI * 2
    const radius = size * randomRange(0.65, 1.15)
    points.push(Math.cos(angle) * radius, Math.sin(angle) * radius)
  }
  view.poly(points, true).fill({ color: 0x3a322e, alpha: 1 })
  view.stroke({ color: 0xb16a3e, width: Math.max(0.4, size * 0.12), alpha: 0.5 })
  return view
}

export function BlackHoleScene() {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    let disposed = false
    const app = new Application()
    const queuedFeedPoints: FeedPoint[] = []

    const start = async () => {
      await app.init({
        resizeTo: host,
        backgroundAlpha: 0,
        antialias: true,
        autoDensity: true,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        powerPreference: 'high-performance',
        preference: 'webgl',
      })
      if (disposed) { app.destroy(true); return }
      app.canvas.className = 'black-hole-canvas'
      host.appendChild(app.canvas)
      app.stage.sortableChildren = true
      app.stage.eventMode = 'static'
      app.stage.hitArea = new Rectangle(0, 0, app.screen.width, app.screen.height)

      const background = new Container()
      const shaderLayer = new Container()
      const backMatter = new Container()
      const jets = new Container()
      const core = new Container()
      const frontMatter = new Container()
      const feedLayer = new Container()
      const overlay = new Container()
      ;[background, shaderLayer, backMatter, jets, core, frontMatter, feedLayer, overlay].forEach((layer, index) => { layer.zIndex = index * 10; app.stage.addChild(layer) })

      const starField = new Graphics()
      const nebula = new Graphics()
      background.addChild(starField, nebula)
      const lensingFilter = new Filter({
        glProgram: new GlProgram({ vertex: FILTER_VERTEX, fragment: LENSING_FRAGMENT }),
        resources: { lensUniforms: {
          uTime: { value: 0, type: 'f32' },
          uAspect: { value: 1, type: 'f32' },
          uCoreRadius: { value: 0.015, type: 'f32' },
          uSpin: { value: 0.15, type: 'f32' },
        } }, antialias: 'inherit',
      })
      background.filters = [lensingFilter]

      const surface = new Graphics()
      shaderLayer.addChild(surface)
      const diskFilter = new Filter({
        glProgram: new GlProgram({ vertex: FILTER_VERTEX, fragment: DISK_FRAGMENT }),
        resources: { blackHoleUniforms: {
          uTime: { value: 0, type: 'f32' }, uAspect: { value: 1, type: 'f32' },
          uCoreRadius: { value: 0.015, type: 'f32' }, uDiskProgress: { value: 0, type: 'f32' },
          uDiskLoad: { value: 0, type: 'f32' }, uRotation: { value: 1, type: 'f32' },
          uHeat: { value: 0.4, type: 'f32' }, uSpin: { value: 0.15, type: 'f32' },
        } }, antialias: 'inherit',
      })
      diskFilter.blendMode = 'add'
      surface.filters = [diskFilter]

      const photonRing = new Graphics(), eventHorizon = new Graphics(), innerShadow = new Graphics(), guides = new Graphics()
      core.addChild(photonRing, eventHorizon, innerShadow)
      overlay.addChild(guides)

      const orbital: OrbitalParticle[] = []
      const feeds: FeedParticle[] = []
      const jetParticles: JetParticle[] = []
      for (let i = 0; i < 260; i += 1) {
        const rock = i < 38, size = rock ? randomRange(2.8, 8.8) : randomRange(0.55, 2.25)
        const view = rock ? makeRock(size) : new Graphics().circle(0, 0, size).fill(0xffffff)
        orbital.push({ view, angle: randomRange(0, Math.PI * 2), radiusFactor: Math.pow(Math.random(), 0.64), speedFactor: randomRange(0.55, 1.75), phase: Math.random(), rock })
        backMatter.addChild(view)
      }
      const stars = Array.from({ length: 320 }, () => ({ x: Math.random(), y: Math.random(), size: Math.pow(Math.random(), 2.5) * 1.9 + 0.22, alpha: randomRange(0.16, 0.86), warmth: Math.random() }))

      const redraw = () => {
        starField.clear(); nebula.clear(); surface.clear().rect(0, 0, app.screen.width, app.screen.height).fill(0xffffff)
        const w = app.screen.width, h = app.screen.height
        nebula.ellipse(w * .34, h * .54, w * .42, h * .12).fill({ color: 0x243246, alpha: .09 })
          .ellipse(w * .68, h * .47, w * .36, h * .085).fill({ color: 0x5b3928, alpha: .055 })
          .ellipse(w * .52, h * .50, w * .55, h * .035).fill({ color: 0xd08a52, alpha: .028 })
        for (const star of stars) starField.circle(star.x * w, star.y * h, star.size).fill({ color: star.warmth > .88 ? 0xffcfaa : star.warmth < .12 ? 0x9bc8ff : 0xd9e7ff, alpha: star.alpha })
      }

      const makeFeed = (point: FeedPoint | undefined, infall: number) => {
        const cx = app.screen.width / 2, cy = app.screen.height / 2, maxR = Math.max(190, Math.min(app.screen.width, app.screen.height) * .47)
        const source = point ?? { x: cx + Math.cos(randomRange(0, Math.PI * 2)) * maxR, y: cy + Math.sin(randomRange(0, Math.PI * 2)) * maxR * .48 }
        const dx = source.x - cx, dy = (source.y - cy) / .32, size = randomRange(3.2, 7.4)
        const view = Math.random() > .72 ? makeRock(size) : new Graphics().circle(0, 0, size).fill(0xf6e1b9)
        feedLayer.addChild(view)
        feeds.push({ view, angle: Math.atan2(dy, dx), radius: clamp(Math.hypot(dx, dy), 150, maxR * 1.4), duration: clamp((2.2 + infall * .28) * randomRange(.86, 1.24), 3, 42), age: 0, rotations: randomRange(2.8, 6.4) })
      }

      const onPointer = (event: FederatedPointerEvent) => { queuedFeedPoints.push({ x: event.global.x, y: event.global.y }); useGameStore.getState().feed() }
      app.stage.on('pointerdown', onPointer)
      let feedPulse = useGameStore.getState().feedPulse, oldW = 0, oldH = 0, jetClock = 0, elapsed = 0

      app.ticker.add((ticker) => {
        const dt = Math.min(.05, ticker.deltaMS / 1000); elapsed += dt
        const state = useGameStore.getState(), d = deriveSimulation(state)
        if (oldW !== app.screen.width || oldH !== app.screen.height) { oldW = app.screen.width; oldH = app.screen.height; app.stage.hitArea = new Rectangle(0, 0, oldW, oldH); redraw() }
        const cx = oldW / 2, cy = oldH / 2, minV = Math.min(oldW, oldH), ratio = Math.max(1, d.coreMassKg / (GAME.startingCoreMass * MASS_UNIT_KG))
        const coreR = clamp(4.5 + Math.log10(ratio) * 17, 4.5, minV * .2), normalized = coreR / minV
        const inner = Math.max(coreR * 2.25, 22), outer = clamp(Math.max(70, coreR * 5.7) * (.78 + d.diskFormationProgress * .36), 70, minV * .44)
        const tilt = clamp(.26 + state.spin * .08, .26, .34), heat = clamp((Math.log10(Math.max(d.diskTemperatureKelvin, 1)) - 7.5) / 2.2, 0, 1), aspect = oldW / oldH
        const lu = lensingFilter.resources.lensUniforms.uniforms as { uTime:number;uAspect:number;uCoreRadius:number;uSpin:number }
        Object.assign(lu, { uTime: elapsed, uAspect: aspect, uCoreRadius: normalized, uSpin: state.spin })
        const du = diskFilter.resources.blackHoleUniforms.uniforms as BlackHoleUniforms
        Object.assign(du, { uTime: elapsed, uAspect: aspect, uCoreRadius: normalized, uDiskProgress: d.diskFormationProgress, uDiskLoad: clamp(d.diskLoad, 0, 3), uRotation: d.diskRotationPerSecond, uHeat: heat, uSpin: state.spin })
        while (feedPulse < state.feedPulse) { makeFeed(queuedFeedPoints.shift(), d.infallTimeSeconds); feedPulse += 1 }

        photonRing.clear().circle(cx, cy, coreR * 1.28).stroke({ color: heat > .72 ? 0xe6f2ff : 0xffdfb8, width: Math.max(1, coreR * .08), alpha: .18 + d.diskFormationProgress * .55 })
        eventHorizon.clear().circle(cx, cy, coreR).fill(0x000000)
        innerShadow.clear().circle(cx - coreR * .16, cy - coreR * .14, coreR * .73).fill({ color: 0x010104, alpha: .82 })
        guides.clear().circle(cx, cy, coreR * 1.62).stroke({ color: 0xdfe9ff, width: .7, alpha: .09 + d.diskFormationProgress * .06 })

        const dustCount = Math.floor(8 + d.diskFormationProgress * 205), rockCount = Math.floor(1 + d.diskFormationProgress * 37)
        for (let i = 0; i < orbital.length; i += 1) {
          const p = orbital[i], visible = p.rock ? i < rockCount : i < 38 + dustCount
          p.view.visible = visible; if (!visible) continue
          const radius = inner + (outer - inner) * (.08 + p.radiusFactor * .92)
          p.angle += d.diskRotationPerSecond * Math.PI * 2 * p.speedFactor * Math.pow(outer / radius, .72) * dt
          const depth = Math.sin(p.angle)
          p.view.x = cx + Math.cos(p.angle) * radius
          p.view.y = cy + depth * radius * tilt + Math.sin(elapsed * .7 + p.phase * 15) * coreR * .06
          p.view.rotation += dt * (p.rock ? .4 : .1) * p.speedFactor
          p.view.alpha = clamp((p.rock ? .38 : .10) + (depth + 1) * (p.rock ? .22 : .28), .05, p.rock ? .86 : .72) * clamp(d.diskFormationProgress * 1.7 + .12, 0, 1)
          p.view.scale.set((p.rock ? .65 : .78) + (depth + 1) * .13)
          if (!p.rock) p.view.tint = heat > .76 ? 0xddeeff : heat > .38 ? 0xffb45d : 0xd47a38
          const target = depth > 0 ? frontMatter : backMatter; if (p.view.parent !== target) target.addChild(p.view)
        }

        for (let i = feeds.length - 1; i >= 0; i -= 1) {
          const p = feeds[i]; p.age += dt; const progress = clamp(p.age / p.duration, 0, 1), eased = 1 - Math.pow(1 - progress, 1.75)
          const radius = p.radius * (1 - eased) + inner * .88, angle = p.angle + p.rotations * Math.PI * 2 * eased * (.28 + progress * 2.1)
          p.view.x = cx + Math.cos(angle) * radius; p.view.y = cy + Math.sin(angle) * radius * tilt; p.view.rotation += dt * (.8 + progress * 4.5)
          p.view.alpha = progress < .84 ? .96 : 1 - (progress - .84) / .16; p.view.scale.set(Math.max(.08, 1 - progress * .72)); p.view.tint = progress > .62 ? 0xffb45d : 0xe1c69b
          if (progress >= 1) { feedLayer.removeChild(p.view); p.view.destroy(); feeds.splice(i, 1) }
        }

        jetClock += (d.diskFormed ? d.ejectionRate * 12 + Math.max(0, d.diskLoad - .8) * 2.4 : 0) * dt
        while (jetClock >= 1 && jetParticles.length < 170) {
          const direction: -1 | 1 = Math.random() > .5 ? 1 : -1, view = new Graphics().circle(0, 0, randomRange(.7, 2.2)).fill(0xd7ecff), life = randomRange(.9, 2.1)
          jets.addChild(view); jetParticles.push({ view, xOffset: randomRange(-coreR * .22, coreR * .22), y: randomRange(coreR * .7, coreR * 1.25), velocity: randomRange(90, 230), life, maxLife: life, direction }); jetClock -= 1
        }
        for (let i = jetParticles.length - 1; i >= 0; i -= 1) {
          const p = jetParticles[i]; p.life -= dt; p.y += p.velocity * dt; const life = p.life / p.maxLife
          p.view.x = cx + p.xOffset + Math.sin(elapsed * 8 + i) * (1 - life) * coreR * .48; p.view.y = cy + p.direction * p.y; p.view.alpha = clamp(life * .68, 0, .68); p.view.scale.set(.5 + life * .72)
          if (p.life <= 0) { jets.removeChild(p.view); p.view.destroy(); jetParticles.splice(i, 1) }
        }
      })
    }
    void start()
    return () => { disposed = true; if (app.stage) app.stage.removeAllListeners(); if (app.canvas?.parentNode === host) host.removeChild(app.canvas); app.destroy(true, { children: true }) }
  }, [])

  return <div className="black-hole-scene" ref={hostRef}><div className="scene-instruction">Материя формирует диск постепенно</div></div>
}
