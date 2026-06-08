export const HDR_URL =
  "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/ludwikowice_farmland_1k.hdr";

export const MODEL_URL = new URL(
  "./sikorsky_ch-53e_sea_stallion_compressed.glb",
  import.meta.url,
).href;

export const BASIS_TRANSCODER_PATH = "/basis/";

export const QUALITY_PRESETS = {
  low: {
    label: "Low",
    bloom: false,
    dof: false,
    gtao: false,
    lensflare: false,
    chromaticAberration: false,
    bloomStrength: 0,
    bloomRadius: 0.3,
    bloomThreshold: 0.85,
    dofMinDistance: 1,
    dofMaxDistance: 3,
    dofBlurSize: 2,
    dofBlurSpread: 4,
  },
  med: {
    label: "Med",
    bloom: true,
    dof: false,
    gtao: false,
    lensflare: false,
    chromaticAberration: false,
    bloomStrength: 0.05,
    bloomRadius: 0.8,
    bloomThreshold: 0.95,
    dofMinDistance: 1,
    dofMaxDistance: 3,
    dofBlurSize: 2,
    dofBlurSpread: 4,
  },
  ultra: {
    label: "Ultra",
    bloom: true,
    dof: true,
    gtao: true,
    lensflare: true,
    chromaticAberration: true,
    bloomStrength: 0.05,
    bloomRadius: 0.8,
    bloomThreshold: 0.95,
    gtaoResolutionScale: 0.5,
    lensflareThreshold: 0.35,
    caStrength: 1.2,
    caScale: 0.25,
    caEdgeInner: 0.52,
    caEdgeOuter: 0.62,
    dofMinDistance: 0.5,
    dofMaxDistance: 8.5,
    dofBlurSize: 3,
    dofBlurSpread: 2,
  },
};
