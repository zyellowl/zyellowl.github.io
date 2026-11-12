(function () {
  var reduce = false;
  try {
    reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (err) {
    reduce = false;
  }

  var root = document.querySelector(".window");
  var cursor = document.getElementById("cursor");
  var promptEl = document.getElementById("prompt");
  var trace = document.getElementById("trace");
  var answer = document.getElementById("answer");
  var live = document.getElementById("live");
  var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-run]"));
  var token = 0;

  var runs = {
    who: {
      id: "who",
      prompt: "张磊是做什么的？",
      steps: [
        {
          tool: "read_resume",
          arg: "简介",
          ms: 800,
          result: "10 年研发。2023 年起做大模型应用，后来做到多智能体、实时多模态和 Agent Harness。现在在蚂蚁集团财保事业群。",
          links: [{ href: "/#work", text: "工作" }]
        },
        {
          tool: "open_case",
          arg: "大保",
          ms: 1100,
          result: "面向蚁小保持续迭代。大保 CLI 是统一内核，定时任务沿生产回流、问题发现、分级修复、沙箱验证、评测门禁，再发布回流。同一套 CLI 也接到钉钉。",
          links: [{ href: "/work/case-02", text: "大保 Harness" }]
        },
        {
          tool: "open_case",
          arg: "相机",
          ms: 900,
          result: "蚁小保里的实时音视频把媒体和业务推理分开。链路是 VAD / ASR，然后模型推理，再 TTS。人可以插话。这一轮的画面在话说完时和识别文本一起交出去。",
          links: [{ href: "/work/case-01", text: "蚁小保" }]
        },
        {
          tool: "run_eval",
          arg: "路由",
          ms: 1000,
          result: "案例页上写的是：路由结合粗分流、槽位校验和澄清补齐，项目评测里路由准确率达到 90%。",
          links: [{ href: "/work/case-01", text: "写在蚁小保" }]
        }
      ],
      answer: [
        { text: "我在蚂蚁做保险场景的 Agent。相机和实时语音在" },
        { text: "蚁小保", href: "/work/case-01" },
        { text: "。线上的问题回来，修完，在沙箱里验过，评测过了再发出去，是" },
        { text: "大保", href: "/work/case-02" },
        { text: "这条循环。" }
      ]
    },
    work: {
      id: "work",
      prompt: "他做过什么？",
      steps: [
        {
          tool: "list_cases",
          arg: "蚂蚁",
          ms: 800,
          result: "2024 年 9 月至今，在财保做蚁小保、大保 Harness 和数据工厂。",
          links: [
            { href: "/work/case-01", text: "蚁小保" },
            { href: "/work/case-02", text: "大保 Harness" },
            { href: "/work/case-03", text: "数据工厂" }
          ]
        },
        {
          tool: "list_cases",
          arg: "京东",
          ms: 1000,
          result: "2021 年 9 月到 2024 年 9 月。领航者把营销费用、活动、人群和数据分析串进对话，另外做过统一 RAG。还有金融首页 Feed 和智能问答。",
          links: [
            { href: "/work/case-04", text: "京东领航者" },
            { href: "/work/case-05", text: "京东金融首页 Feed" },
            { href: "/work/case-06", text: "京东金融智能问答" }
          ]
        },
        {
          tool: "list_cases",
          arg: "更早",
          ms: 800,
          result: "高思做过在线商城和业务数据异常检测。百度金融参与信贷基础服务平台，时间是 2017 年 6 月到 2020 年 5 月。",
          links: [
            { href: "/work/case-07", text: "在线商城与异常检测" },
            { href: "/work/case-08", text: "信贷基础服务平台" }
          ]
        }
      ],
      answer: [
        { text: "蚂蚁这边是" },
        { text: "蚁小保", href: "/work/case-01" },
        { text: "、" },
        { text: "大保", href: "/work/case-02" },
        { text: "和" },
        { text: "数据工厂", href: "/work/case-03" },
        { text: "。京东那几年做过" },
        { text: "领航者", href: "/work/case-04" },
        { text: "、首页 Feed 和智能问答。再早是高思的商城，以及百度金融的信贷平台。" }
      ]
    },
    dabao: {
      id: "dabao",
      prompt: "大保是什么？",
      steps: [
        {
          tool: "open_case",
          arg: "大保",
          ms: 900,
          result: "面向蚁小保持续迭代的 Agent Harness，内核是大保 CLI。",
          links: [{ href: "/work/case-02", text: "大保 Harness" }]
        },
        {
          tool: "read_loop",
          arg: "步骤",
          ms: 1000,
          result: "生产回流，问题发现，分级修复，沙箱验证，评测门禁，发布回流。简单问题可以自动修，放进按生产复刻的沙箱，评测过了再随发布走。"
        },
        {
          tool: "open_bot",
          arg: "钉钉",
          ms: 900,
          result: "钉钉 Bot 复用这套 CLI。本机运行时调度 Codex，结果回到群里。每个人把负责的模块写成一份 Harness，Bot 按需加载。"
        }
      ],
      answer: [
        { text: "大保是给蚁小保改自己用的循环。内核是 CLI，定时把线上问题找出来，验过再发出去。同一套也接到钉钉，给组里用。详见" },
        { text: "大保 Harness", href: "/work/case-02" },
        { text: "。" }
      ]
    },
    camera: {
      id: "camera",
      prompt: "相机和实时语音？",
      steps: [
        {
          tool: "open_case",
          arg: "语音",
          ms: 900,
          result: "链路是 VAD / ASR，模型推理，再 TTS。媒体和业务推理是分开的。用户可以插话打断，已经播出的和还在缓冲里的要分开。"
        },
        {
          tool: "open_case",
          arg: "话轮",
          ms: 1000,
          result: "视频用 VAD 的起止圈住这一轮上传的帧。旁路模型看画面有没有效。话说完时，帧和 ASR 文本一起交给多模态模型。"
        },
        {
          tool: "open_case",
          arg: "图片",
          ms: 800,
          result: "拍照和图片文件也能接着问。理赔照片一类材料先做成上下文，放进这个人的 Workspace。",
          links: [{ href: "/work/case-01", text: "蚁小保" }]
        }
      ],
      answer: [
        { text: "相机和实时语音都在" },
        { text: "蚁小保", href: "/work/case-01" },
        { text: "。说话从检测、识别走到推理和合成，人可以中途插话。这一轮看见的画面，在话说完时和文本一起交出去。" }
      ]
    },
    blog: {
      id: "blog",
      prompt: "最近在写什么？",
      steps: [
        {
          tool: "open_blog",
          arg: "2026-05",
          ms: 900,
          result: "最近一篇是「Agent 其实是 Harness」。",
          links: [{ href: "/blog/2026-05-12-agent-jiu-shi-harness", text: "Open" }]
        },
        {
          tool: "open_blog",
          arg: "2026-04",
          ms: 800,
          result: "再往前一篇是「会话该怎么切」。",
          links: [{ href: "/blog/2026-04-18-huihua-gai-zenme-qie", text: "Open" }]
        },
        {
          tool: "open_blog",
          arg: "目录",
          ms: 700,
          result: "文章按日期排在文章页。",
          links: [{ href: "/blog", text: "All posts" }]
        }
      ],
      answer: [
        { text: "最近一篇是" },
        { text: "Agent 其实是 Harness", href: "/blog/2026-05-12-agent-jiu-shi-harness" },
        { text: "。再往前是" },
        { text: "会话该怎么切", href: "/blog/2026-04-18-huihua-gai-zenme-qie" },
        { text: "。目录在" },
        { text: "文章", href: "/blog" },
        { text: "。" }
      ]
    }
  };

  function wait(ms, mark) {
    return new Promise(function (resolve) {
      window.setTimeout(function () {
        resolve(mark === token);
      }, ms);
    });
  }

  function setPressed(id) {
    buttons.forEach(function (btn) {
      btn.setAttribute("aria-pressed", btn.getAttribute("data-run") === id ? "true" : "false");
    });
  }

  function linkRow(links) {
    var p = document.createElement("p");
    p.className = "result-links";
    links.forEach(function (link) {
      var a = document.createElement("a");
      a.href = link.href;
      a.textContent = link.text;
      p.appendChild(a);
    });
    return p;
  }

  function fillResult(parent, step) {
    var box = document.createElement("div");
    box.className = "result";
    var p = document.createElement("p");
    p.textContent = step.result;
    box.appendChild(p);
    if (step.links && step.links.length) box.appendChild(linkRow(step.links));
    parent.appendChild(box);
  }

  function rowBits(step, label) {
    var ico = document.createElement("span");
    ico.className = "ico";
    ico.setAttribute("aria-hidden", "true");
    var tool = document.createElement("span");
    tool.className = "tool";
    tool.textContent = step.tool;
    var arg = document.createElement("span");
    arg.className = "arg";
    arg.textContent = step.arg;
    var ms = document.createElement("span");
    ms.className = "ms";
    ms.textContent = label;
    return [ico, tool, arg, ms];
  }

  function clearTrace() {
    Array.prototype.slice.call(trace.children).forEach(function (child) {
      if (child !== cursor) child.remove();
    });
  }

  function moveCursor(el) {
    if (!cursor) return;
    if (!el || reduce) {
      cursor.hidden = true;
      return;
    }
    cursor.hidden = false;
    cursor.style.transform = "translateY(" + (el.offsetTop + 16) + "px)";
  }

  function renderRunning(step) {
    var row = document.createElement("div");
    row.className = "step";
    row.dataset.state = "run";
    var line = document.createElement("div");
    line.className = "row";
    rowBits(step, "在读").forEach(function (node) { line.appendChild(node); });
    row.appendChild(line);
    return row;
  }

  function renderDone(step, open) {
    var details = document.createElement("details");
    details.className = "step";
    details.dataset.state = "done";
    if (open) details.open = true;
    var summary = document.createElement("summary");
    var seconds = (step.ms / 1000).toFixed(1) + "s";
    rowBits(step, seconds).forEach(function (node) { summary.appendChild(node); });
    summary.addEventListener("click", function () {
      details.dataset.user = "1";
    });
    summary.querySelector(".ico").textContent = "✓";
    details.appendChild(summary);
    fillResult(details, step);
    return details;
  }

  function paintAnswer(parts) {
    answer.textContent = "";
    parts.forEach(function (part) {
      if (part.href) {
        var a = document.createElement("a");
        a.href = part.href;
        a.textContent = part.text;
        answer.appendChild(a);
      } else {
        answer.appendChild(document.createTextNode(part.text));
      }
    });
  }

  function showFinal(run) {
    token += 1;
    setPressed(run.id);
    promptEl.textContent = run.prompt;
    clearTrace();
    moveCursor(null);
    run.steps.forEach(function (step) {
      trace.appendChild(renderDone(step, false));
    });
    paintAnswer(run.answer);
    root.setAttribute("aria-busy", "false");
    live.textContent = "回放结束。" + answer.textContent;
  }

  function typeAnswer(run, mark) {
    answer.textContent = "";
    var caret = document.createElement("span");
    caret.className = "caret";
    caret.setAttribute("aria-hidden", "true");
    answer.appendChild(caret);
    var parts = run.answer;
    var index = 0;
    var charAt = 0;
    return new Promise(function (resolve) {
      function tick() {
        if (mark !== token) {
          resolve(false);
          return;
        }
        if (index >= parts.length) {
          caret.remove();
          resolve(true);
          return;
        }
        var part = parts[index];
        if (part.href) {
          var a = document.createElement("a");
          a.href = part.href;
          a.textContent = part.text;
          answer.insertBefore(a, caret);
          index += 1;
          charAt = 0;
          window.setTimeout(tick, 36);
          return;
        }
        var bit = document.createElement("span");
        bit.className = "tok";
        bit.textContent = part.text.slice(charAt, charAt + 2);
        answer.insertBefore(bit, caret);
        charAt += 2;
        if (charAt >= part.text.length) {
          index += 1;
          charAt = 0;
        }
        window.setTimeout(tick, 28);
      }
      tick();
    });
  }

  function closeAuto() {
    Array.prototype.forEach.call(trace.querySelectorAll("details[open]"), function (d) {
      if (!d.dataset.user) d.open = false;
    });
  }

  async function play(run) {
    var mark = ++token;
    setPressed(run.id);
    promptEl.textContent = run.prompt;
    clearTrace();
    answer.textContent = "";
    root.setAttribute("aria-busy", "true");
    live.textContent = "开始回放。" + run.prompt;
    for (var i = 0; i < run.steps.length; i++) {
      var step = run.steps[i];
      var running = renderRunning(step);
      trace.appendChild(running);
      moveCursor(running);
      var ok = await wait(step.ms, mark);
      if (!ok) return;
      var done = renderDone(step, true);
      running.replaceWith(done);
      closeAuto();
      done.open = true;
      moveCursor(done);
    }
    ok = await wait(240, mark);
    if (!ok) return;
    ok = await typeAnswer(run, mark);
    if (!ok) return;
    closeAuto();
    moveCursor(null);
    root.setAttribute("aria-busy", "false");
    live.textContent = "回放结束。" + answer.textContent;
  }

  buttons.forEach(function (btn, index) {
    btn.addEventListener("click", function () {
      var run = runs[btn.getAttribute("data-run")];
      if (!run) return;
      if (reduce) showFinal(run);
      else play(run);
    });
    btn.addEventListener("keydown", function (event) {
      var next = null;
      if (event.key === "ArrowDown" || event.key === "ArrowRight") next = buttons[index + 1] || buttons[0];
      if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = buttons[index - 1] || buttons[buttons.length - 1];
      if (event.key === "Home") next = buttons[0];
      if (event.key === "End") next = buttons[buttons.length - 1];
      if (!next || next === btn) return;
      event.preventDefault();
      next.focus();
    });
  });

  root.classList.add("armed");
  if (reduce) showFinal(runs.who);
  else play(runs.who).catch(function () {
    document.documentElement.classList.remove("will-play");
  });
})();
