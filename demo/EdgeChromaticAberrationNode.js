import { TempNode } from 'three/webgpu'
import { Fn, convertToTexture, float, nodeObject, smoothstep, uv, vec2, vec4 } from 'three/tsl'

/**
 * Chromatic aberration limited to screen edges via radial falloff.
 * Based on three.js ChromaticAberrationNode.
 */
class EdgeChromaticAberrationNode extends TempNode {
  static get type() {
    return 'EdgeChromaticAberrationNode'
  }

  constructor(textureNode, strengthNode, centerNode, scaleNode, edgeInnerNode, edgeOuterNode) {
    super('vec4')

    this.textureNode = textureNode
    this.strengthNode = strengthNode
    this.centerNode = centerNode
    this.scaleNode = scaleNode
    this.edgeInnerNode = edgeInnerNode
    this.edgeOuterNode = edgeOuterNode
  }

  setup() {
    const textureNode = this.textureNode
    const uvNode = textureNode.uvNode || uv()

    const ApplyEdgeChromaticAberration = Fn(([uvCoord, strength, center, scale, edgeInner, edgeOuter]) => {
      const offset = uvCoord.sub(center)
      const distance = offset.length()

      const maxDist = float(0.707)
      const normalizedDist = distance.div(maxDist)
      const edgeMask = smoothstep(edgeInner, edgeOuter, normalizedDist)
      const effectiveStrength = strength.mul(edgeMask)

      const redScale = float(1.0).add(scale.mul(0.02).mul(effectiveStrength))
      const greenScale = float(1.0)
      const blueScale = float(1.0).sub(scale.mul(0.02).mul(effectiveStrength))

      const aberrationStrength = effectiveStrength.mul(distance)

      const redUV = center.add(offset.mul(redScale))
      const greenUV = center.add(offset.mul(greenScale))
      const blueUV = center.add(offset.mul(blueScale))

      const rOffset = offset.mul(aberrationStrength).mul(float(0.01))
      const gOffset = offset.mul(aberrationStrength).mul(float(0.0))
      const bOffset = offset.mul(aberrationStrength).mul(float(-0.01))

      const finalRedUV = redUV.add(rOffset)
      const finalGreenUV = greenUV.add(gOffset)
      const finalBlueUV = blueUV.add(bOffset)

      const r = textureNode.sample(finalRedUV).r
      const g = textureNode.sample(finalGreenUV).g
      const b = textureNode.sample(finalBlueUV).b
      const a = textureNode.sample(uvCoord).a

      return vec4(r, g, b, a)
    }).setLayout({
      name: 'EdgeChromaticAberrationShader',
      type: 'vec4',
      inputs: [
        { name: 'uv', type: 'vec2' },
        { name: 'strength', type: 'float' },
        { name: 'center', type: 'vec2' },
        { name: 'scale', type: 'float' },
        { name: 'edgeInner', type: 'float' },
        { name: 'edgeOuter', type: 'float' },
      ],
    })

    return ApplyEdgeChromaticAberration(
      uvNode,
      this.strengthNode,
      this.centerNode,
      this.scaleNode,
      this.edgeInnerNode,
      this.edgeOuterNode
    )
  }
}

export const edgeChromaticAberration = (
  node,
  strength = 1.0,
  center = vec2(0.5, 0.5),
  scale = 1.1,
  edgeInner = 0.55,
  edgeOuter = 0.95
) =>
  nodeObject(
    new EdgeChromaticAberrationNode(
      convertToTexture(node),
      nodeObject(strength),
      nodeObject(center),
      nodeObject(scale),
      nodeObject(edgeInner),
      nodeObject(edgeOuter)
    )
  )
