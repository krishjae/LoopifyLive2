export async function mockAnalyze(file) {
  await new Promise((r) => setTimeout(r, 1200));

  return {
    scale: "C Major",
    raga: "Kalyani (Demo)",
    emotion: "Uplifting",
    genre: "Pop / Fusion",
    explanation:
      "The pitch distribution strongly centers around the tonic with stable major intervals. Bright harmonic content and moderate tempo contribute to an uplifting emotional classification. Genre aligns with pop/fusion due to rhythmic consistency and spectral profile."
  };
}
