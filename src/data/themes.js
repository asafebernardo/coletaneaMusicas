export const DEFAULT_THEMES = [
  {
    label: "Louvor",
    description: "Exaltação e glorificação a Deus.",
  },
  {
    label: "Adoração",
    description: "Amor, reverência e entrega a Deus.",
  },
  {
    label: "Gratidão",
    description: "Agradecimento pelas bênçãos recebidas.",
  },
  {
    label: "Oração",
    description: "Pedidos, súplicas e comunhão com Deus.",
  },
  {
    label: "Fé e Esperança",
    description: "Confiança em Deus e em Suas promessas.",
  },
  {
    label: "Jesus Cristo",
    description: "Vida, obra, cruz e ressurreição de Jesus.",
  },
  {
    label: "Espírito Santo",
    description: "Presença e ação do Espírito Santo.",
  },
  {
    label: "Salvação",
    description: "Perdão, redenção e vida eterna.",
  },
  {
    label: "Vida Cristã",
    description: "Santidade, obediência e caminhada com Deus.",
  },
];

export const THEME_DESCRIPTIONS = new Map(
  DEFAULT_THEMES.map((item) => [item.label.toLowerCase(), item.description]),
);
