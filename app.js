import { isConfigured, fetchProjects, fetchTimeline, fetchSkills } from "./supabase.js";

const nodes = {
  projects: document.getElementById("projects"),
  timeline: document.getElementById("timeline"),
  skills: document.getElementById("skills"),
  alert: document.getElementById("alert"),
};

function make(tag, className) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}

function text(tag, className, value) {
  const node = make(tag, className);
  node.textContent = value ?? "";
  return node;
}

function showAlert(message) {
  nodes.alert.hidden = false;
  nodes.alert.textContent = message;
}

function showEmpty(container, message) {
  container.replaceChildren(
    text(container.tagName === "OL" || container.tagName === "UL" ? "li" : "p", "placeholder", message)
  );
}

function formatDate(value) {
  return value ? value.replace(/-/g, ".") : "";
}

function renderProjects(items) {
  if (!items.length) {
    showEmpty(nodes.projects, "还没有项目，登录后在后台添加。");
    return;
  }

  nodes.projects.replaceChildren(
    ...items.map((item) => {
      const card = make("article", "card project");
      card.append(text("h3", null, item.title));
      if (item.description) card.append(text("p", "desc", item.description));

      if (item.stack?.length) {
        const chips = make("div", "chips");
        for (const name of item.stack) chips.append(text("span", "chip", name));
        card.append(chips);
      }

      if (item.link && /^https?:\/\//i.test(item.link)) {
        const link = make("a", "link");
        link.href = item.link;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "查看项目 →";
        card.append(link);
      }

      return card;
    })
  );
}

function renderTimeline(items) {
  if (!items.length) {
    showEmpty(nodes.timeline, "还没有时间线记录。");
    return;
  }

  nodes.timeline.replaceChildren(
    ...items.map((item) => {
      const entry = make("li", "entry");

      const meta = make("div", "entry-meta");
      meta.append(text("time", "entry-date", formatDate(item.date)));
      entry.append(meta);

      const card = make("div", "card entry-card");
      card.append(text("h3", null, item.title));
      if (item.description) card.append(text("p", "desc", item.description));

      if (item.tags?.length) {
        const chips = make("div", "chips");
        for (const tag of item.tags) chips.append(text("span", "chip", tag));
        card.append(chips);
      }

      entry.append(card);
      return entry;
    })
  );
}

function renderSkills(items) {
  if (!items.length) {
    showEmpty(nodes.skills, "还没有技能记录。");
    return;
  }

  nodes.skills.replaceChildren(
    ...items.map((item) => {
      const level = Math.min(Math.max(Number(item.level) || 0, 0), 5);

      const row = make("li", "skill");
      const head = make("div", "skill-head");
      head.append(text("span", "skill-name", item.name));
      head.append(text("span", "skill-level", `${level} / 5`));

      const bar = make("div", "bar");
      const fill = make("div", "bar-fill");
      fill.style.width = `${level * 20}%`;
      bar.append(fill);

      row.append(head, bar);
      return row;
    })
  );
}

async function load() {
  try {
    const [projects, timeline, skills] = await Promise.all([
      fetchProjects(),
      fetchTimeline(),
      fetchSkills(),
    ]);
    renderProjects(projects);
    renderTimeline(timeline);
    renderSkills(skills);
  } catch (err) {
    showAlert(`读取数据失败：${err.message}　请检查表名与 RLS 的 SELECT 策略。`);
    showEmpty(nodes.projects, "加载失败");
    showEmpty(nodes.timeline, "加载失败");
    showEmpty(nodes.skills, "加载失败");
  }
}

if (!isConfigured) {
  showAlert("尚未配置 Supabase：请打开 config.js 填入 Project URL 与 publishable key。");
  showEmpty(nodes.projects, "未配置");
  showEmpty(nodes.timeline, "未配置");
  showEmpty(nodes.skills, "未配置");
} else {
  load();
}