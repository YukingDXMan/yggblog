// シンプルなローカルタイムライン機能（localStorageに保存）
document.addEventListener('DOMContentLoaded', function(){
  const maxChars = 280;
  const composeText = document.getElementById('compose-text');
  const charCount = document.getElementById('char-count');
  const submitBtn = document.getElementById('submit-post');
  const postsEl = document.getElementById('posts');
  const newPostBtn = document.getElementById('new-post-btn');

  const defaultUser = {
    name: "あなたの名前",
    handle: "@yours",
    avatar: "https://i.pravatar.cc/40?img=3"
  };

  function loadPosts(){
    const raw = localStorage.getItem('x_like_posts');
    if(!raw) return defaultInitialPosts();
    try{
      return JSON.parse(raw);
    }catch(e){
      return defaultInitialPosts();
    }
  }
  function savePosts(list){
    localStorage.setItem('x_like_posts', JSON.stringify(list));
  }
  function defaultInitialPosts(){
    const sample = [
      {
        id: Date.now() - 200000,
        author: defaultUser,
        content: "はじめまして。これがサンプル投稿だよ。いいねやリツイートを試してみて！",
        time: Date.now() - 200000,
        likes: 2,
        retweets: 1,
        liked: false,
        retweeted: false
      },
      {
        id: Date.now() - 500000,
        author: { name:"開発者", handle:"@dev", avatar:"https://i.pravatar.cc/40?img=5" },
        content: "X風のタイムラインを静的サイトで再現してみた。ローカルに保存されます。",
        time: Date.now() - 500000,
        likes: 5,
        retweets: 0,
        liked: false,
        retweeted: false
      }
    ];
    savePosts(sample);
    return sample;
  }

  let posts = loadPosts();

  function timeAgo(ts){
    const diff = Math.floor((Date.now() - ts) / 1000);
    if(diff < 60) return `${diff}s`;
    if(diff < 3600) return `${Math.floor(diff/60)}m`;
    if(diff < 86400) return `${Math.floor(diff/3600)}h`;
    return `${Math.floor(diff/86400)}d`;
  }

  function render(){
    postsEl.innerHTML = '';
    posts.sort((a,b)=>b.time-a.time);
    posts.forEach(p => postsEl.appendChild(renderPost(p)));
  }

  function renderPost(p){
    const el = document.createElement('div');
    el.className = 'post-card';
    el.dataset.id = p.id;

    el.innerHTML = `
      <img class="avatar" src="${p.author.avatar}" alt="avatar">
      <div class="post-body">
        <div class="post-header">
          <span class="post-name">${escapeHtml(p.author.name)}</span>
          <span class="post-handle">${escapeHtml(p.author.handle)}</span>
          <span class="post-time">· ${timeAgo(p.time)}</span>
        </div>
        <div class="post-content">${escapeHtml(p.content)}</div>
        <div class="post-actions">
          <div class="action-btn reply-btn" title="返信">💬 ${p.replies||0}</div>
          <div class="action-btn retweet-btn ${p.retweeted? 'active': ''}" data-action="retweet">🔁 ${p.retweets}</div>
          <div class="action-btn like-btn ${p.liked? 'active': ''}" data-action="like">❤️ ${p.likes}</div>
        </div>
      </div>
    `;

    // イベント
    const likeBtn = el.querySelector('.like-btn');
    const retweetBtn = el.querySelector('.retweet-btn');
    likeBtn.addEventListener('click', () => toggleLike(p.id));
    retweetBtn.addEventListener('click', () => toggleRetweet(p.id));

    return el;
  }

  function toggleLike(id){
    posts = posts.map(p => {
      if(p.id === id){
        p.liked = !p.liked;
        p.likes = p.liked ? (p.likes||0) + 1 : Math.max((p.likes||0) - 1, 0);
      }
      return p;
    });
    savePosts(posts);
    render();
  }

  function toggleRetweet(id){
    posts = posts.map(p => {
      if(p.id === id){
        p.retweeted = !p.retweeted;
        p.retweets = p.retweeted ? (p.retweets||0) + 1 : Math.max((p.retweets||0) - 1, 0);
      }
      return p;
    });
    savePosts(posts);
    render();
  }

  function postNew(content){
    const newPost = {
      id: Date.now(),
      author: defaultUser,
      content: content.trim(),
      time: Date.now(),
      likes: 0,
      retweets: 0,
      liked: false,
      retweeted: false
    };
    posts.push(newPost);
    savePosts(posts);
    render();
  }

  // 文字数カウント
  composeText.addEventListener('input', function(){
    const left = maxChars - composeText.value.length;
    charCount.textContent = left;
    if(left < 0) charCount.style.color = 'red';
    else charCount.style.color = '';
  });

  submitBtn.addEventListener('click', function(){
    const val = composeText.value;
    if(!val.trim()) return alert('テキストを入力してね');
    postNew(val);
    composeText.value = '';
    charCount.textContent = maxChars;
  });

  // 新規投稿ボタンでフォーカス
  if(newPostBtn){
    newPostBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      composeText.focus();
    });
  }

  // エスケープ関数（簡易）
  function escapeHtml(str){
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // 初回レンダー
  render();
});
