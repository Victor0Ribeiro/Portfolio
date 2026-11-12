# Portfólio · Victor Ribeiro

Portfólio pessoal de Victor Ribeiro, estudante de Análise e Desenvolvimento de Sistemas (FSG) e desenvolvedor
front-end em formação.

**No ar:** <https://portfolio-ten-navy-98.vercel.app>

## Tecnologias

- HTML5 semântico
- CSS3 (Grid, Flexbox, custom properties, `clamp()` para tipografia fluida)
- JavaScript puro, sem frameworks nem build
- Canvas 2D para o fundo animado
- Hospedagem na Vercel

## Estrutura

```
Portfolio/
├── index.html      # Página única: início, sobre, projetos, trajetória e contato
├── style.css       # Estilos e layout responsivo
├── main.js         # Header ao rolar, animação de entrada e link ativo no menu
├── background.js   # Fundo animado em canvas
└── img/            # Imagens em WebP, favicon e imagem de compartilhamento (og.jpg)
```

## Rodar localmente

```bash
git clone https://github.com/Victor0Ribeiro/Portfolio.git
cd Portfolio/Portfolio
```

Abra o `index.html` no navegador. Também funciona com qualquer servidor estático, por exemplo
`npx serve .` ou a extensão Live Server do VS Code.

## Funcionalidades

- Layout responsivo do celular ao desktop
- Seções com animação de entrada conforme a rolagem
- Fundo animado que reage ao cursor e à rolagem, e pausa quando a aba não está visível
- Respeita `prefers-reduced-motion` (animações desligadas para quem prefere menos movimento)
- Acessibilidade: link "pular para o conteúdo", foco visível no teclado e textos alternativos nas imagens
- Meta tags Open Graph para uma prévia bonita ao compartilhar o link

## Deploy na Vercel

O diretório raiz do projeto na Vercel deve ser `Portfolio/`. Se a URL mudar, atualize também `og:url` e
`og:image` no `index.html`.

## Contato

- GitHub: <https://github.com/Victor0Ribeiro>
- LinkedIn: <https://www.linkedin.com/in/ribeiro0victor/>
