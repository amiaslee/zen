import mark from "../../assets/markdown-it-mark.mjs";
import tasks from "../../assets/markdown-it-task-lists.js";

export default function renderMarkdown(text) {
  const md = window.markdownit({
    linkify: true,
    breaks: true,
    highlight: function (str, lang) {
      if (lang && window.hljs.getLanguage(lang)) {
        try {
          return window.hljs.highlight(str, { language: lang }).value;
        } catch (__) { }
      }
      return '';
    }
  })
    .use(mark)
    .use(tasks);

  md.renderer.rules.fence = function (tokens, idx, options, env, self) {
    var token = tokens[idx];
    var info = token.info ? md.utils.unescapeAll(token.info).trim() : '';

    if (info === 'mermaid') {
      return '<div class="mermaid-chart">' + md.utils.escapeHtml(token.content) + '</div>';
    }

    var langName = '';
    var highlighted;

    if (info) {
      langName = info.split(/\s+/g)[0];
    }

    if (options.highlight) {
      highlighted = options.highlight(token.content, langName) || md.utils.escapeHtml(token.content);
    } else {
      highlighted = md.utils.escapeHtml(token.content);
    }

    if (highlighted.indexOf('<pre') === 0) {
      return highlighted + '\n';
    }

    return '<pre><code' + (langName ? ' class="language-' + langName + '"' : '') + '>' +
      highlighted +
      '</code></pre>\n';
  };

  // https://github.com/markdown-it/markdown-it/blob/master/docs/architecture.md#renderer
  var defaultRender = md.renderer.rules.link_open || function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  };
  md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
    tokens[idx].attrSet('target', '_blank');
    return defaultRender(tokens, idx, options, env, self);
  };

  return md.render(text);
}