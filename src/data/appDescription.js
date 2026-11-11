/**
 * Dados e textos exibidos na página "Informações" (acessada pelo menu Mais+).
 *
 * Estrutura:
 * - titulo: Nome principal do aplicativo exibido abaixo da logo.
 * - versao: Data da última compilação/alteração no formato DD.MM.AA.
 * - subtitulo: Título do card principal de apresentação.
 * - boasVindas: Saudação inicial em destaque.
 * - introducao: Parágrafo de apresentação do propósito do aplicativo.
 * - versiculo: Citação bíblica estilizada em destaque (texto + referência).
 * - mensagem: Parágrafos sobre o propósito ministerial e teocêntrico do louvor.
 * - direitosAutorais: Nota de reconhecimento e respeito aos direitos autorais.
 */
export const APP_DESCRIPTION = {
  titulo: "Coletânea de Louvor",
  versao: typeof __APP_VERSION_DATE__ !== "undefined" ? __APP_VERSION_DATE__ : "11.11.26",
  subtitulo: "Sobre o aplicativo",
  boasVindas: "Seja muito bem-vindo(a)!",
  introducao:
    "Este aplicativo foi criado com carinho para auxiliar na consulta de cifras e letras de louvores cristãos.",
  versiculo: {
    introducao: "A Bíblia nos convida:",
    citacao: "“Cantai ao Senhor, bendizei o seu nome; proclamai a sua salvação, dia após dia.”",
    referencia: "Salmos 96:2",
  },
  mensagem: [
    "Nosso desejo é que esta ferramenta seja uma bênção e um instrumento de auxílio para a Igreja, incentivando um louvor fundamentado na Palavra de Deus, verdadeiramente teocêntrico, no qual o Senhor seja sempre o centro de tudo.",
    "Que cada acorde, cada letra e cada canção sejam uma oportunidade de exaltar a Deus, pois somente a Ele pertencem toda honra, toda glória e todo louvor!",
  ],
  direitosAutorais: {
    titulo: "Sobre os direitos autorais:",
    texto:
      "As letras, cifras e músicas disponibilizadas pertencem aos seus respectivos autores, compositores e detentores dos direitos autorais. Reconhecemos e respeitamos o trabalho de cada um, preservando os devidos créditos.",
  },
};
