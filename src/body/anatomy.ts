// Loads the real body surfaces and organ meshes.
//   Male:   BodyParts3D, (c) The Database Center for Life Science, CC BY 4.0.
//   Female: HRA 3D Reference Organs (Visible Human female), HuBMAP Consortium, CC BY 4.0.
// Each is ONE reference person, simplified for the web. They are not scans of the crew.

import * as THREE from 'three'
import type { Build, Vec3 } from './sdf'

export interface Organ {
  name: string
  geometry: THREE.BufferGeometry
  center: Vec3
}

export interface Body {
  attribution: string
  height: number
  skin: THREE.BufferGeometry
  organs: Organ[]
  /** Marker position for each signal. */
  anchors: Record<string, Vec3>
}

interface MeshRef {
  name: string
  pos: number
  verts: number
  idx: number
  tris: number
  center: Vec3
  /** Offset of ready-made smooth normals, when the file has them. */
  nrm?: number
}
interface Manifest {
  bodies: Record<Build, { attribution: string; height: number; skin: MeshRef; organs: MeshRef[]; anchors: Record<string, Vec3> }>
}

/** Which signals each organ shows. */
export const ORGAN_SIGNALS: Record<string, string[]> = {
  brain: ['headache', 'sleep', 'mood'],
  'right eyeball': ['onsd'],
  'left eyeball': ['onsd'],
  heart: ['vitals'],
  'right lung': ['vitals'],
  'left lung': ['vitals'],
  lungs: ['vitals'],
  aorta: ['hematocrit'],
  'blood vessels': ['hematocrit'],
  'left internal jugular vein': ['ijv'],
  'left kidney': ['urine'],
  'right kidney': ['urine'],
  'urinary bladder': ['urine'],
  'vertebral column': ['exercise'],
}

let pending: Promise<Record<Build, Body> | null> | null = null

export function loadAnatomy(): Promise<Record<Build, Body> | null> {
  pending ??= (async () => {
    try {
      const [manifest, buffer] = await Promise.all([
        fetch('/anatomy/anatomy.json').then((r) => (r.ok ? (r.json() as Promise<Manifest>) : Promise.reject())),
        fetch('/anatomy/anatomy.bin').then((r) => (r.ok ? r.arrayBuffer() : Promise.reject())),
      ])
      const geometry = (m: MeshRef) => {
        const g = new THREE.BufferGeometry()
        g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(buffer, m.pos, m.verts * 3), 3))
        g.setIndex(new THREE.BufferAttribute(new Uint32Array(buffer, m.idx, m.tris * 3), 1))
        if (m.nrm !== undefined) g.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(buffer, m.nrm, m.verts * 3), 3))
        else g.computeVertexNormals()
        return g
      }
      const build = (b: Manifest['bodies'][Build]): Body => {
        const organs = b.organs.map((o) => ({ name: o.name, geometry: geometry(o), center: o.center }))
        const at = (name: string, dx = 0, dy = 0, dz = 0): Vec3 | undefined => {
          const o = organs.find((x) => x.name === name)?.center
          return o ? [o[0] + dx, o[1] + dy, o[2] + dz] : undefined
        }
        const found: Record<string, Vec3 | undefined> = {
          onsd: at('left eyeball', 0, 0, 0.02),
          headache: at('brain', -0.03, 0.05, 0.07),
          sleep: at('brain', 0.03, 0.03, -0.06),
          ijv: at('left internal jugular vein'),
          vitals: at('heart', 0, 0, 0.05),
          hematocrit: at('aorta', 0, -0.1, 0),
          urine: at('left kidney'),
          mood: at('brain', 0, -0.02, 0.02),
          immune: at('heart', -0.02, 0.1, 0.05),
          vitd: [0.1, b.height * 0.5, 0.03],
          bodymass: at('small intestine', 0, 0.04, 0.06),
          basics: at('heart', 0.09, 0.07, 0.04),
          exercise: [-0.1, b.height * 0.52, 0.02],
        }
        const anchors: Record<string, Vec3> = { ...b.anchors }
        for (const [k, v] of Object.entries(found)) if (v && !(k in anchors)) anchors[k] = v
        return { attribution: b.attribution, height: b.height, skin: geometry(b.skin), organs, anchors }
      }
      return { male: build(manifest.bodies.male), female: build(manifest.bodies.female) }
    } catch {
      return null
    }
  })()
  return pending
}
