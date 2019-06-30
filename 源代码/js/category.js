$(function () {
  /* 
  1 本地存储
    1 先优化或者重构一下代码 
      1 把渲染标签的代码 提取出来 
        renderLeft()
        renderRight()
    2 添加本地存储的功能
      1 先判断本地存储有没有旧的数据
        有 直接使用旧
        没有 再发送请求去获取新的数据 
      2 自己控制一个过期时间
  2 给右侧内容 添加淡入的效果 
    $(".right_box").html(html2).hide().fadeIn();
  3 添加滚动条的效果 iscroll 重点地方
      1  静态布局  需要把原生的滚动条 隐藏掉
      2 左侧  需要等待标签生成了再去初始化
      3 调用一方法 向上滚动 scrollToElement

      1 需要先修改 标签结构 容器元素的第一个子元素可以滚动。。。。。
  4 正在等待效果 
    1 找一张gif图片 一直旋转  菊花图 
    2- 了解 自己使用fontawesome 来实现这个效果！！！
      只需要给body标签添加一个类 .loadding 
   */

  // 全局变量 存放 接口的数据
  var CateDatas;
  // 左侧的滚动条对象
  var LeftScorll;
  init();
  function init() {
    setHtmlFont();
    loadData();
    eventList();
    window.onresize = function () {
      setHtmlFont();
    }
  }
  // 绑定一坨事件
  function eventList() {
    // 绑定左侧菜单点击事件 --  要注意便签是不是动态生成 是 就通过委托的方式来绑定！！
    $(".pyg_menu").on("tap", "li", function () {
      /* 
      1 激活选中
      2 右侧内容 动态生成了  
        1 获取被点击的li标签的索引  $(this).index()
      3 点击的菜单 向上滚动
        iscroll 里面有的！！！  scrollToElement(dom)
       */
      $(this).addClass("active").siblings().removeClass("active");
      // console.log($(this).index());
      var index = $(this).index();

      renderRight(index);

      // 往上滚动
      LeftScorll.scrollToElement(this);
    })

  }

  // 1 判断有没有旧的数据
  //   没有 发送请求 获取新的数据
  //   有 
  //      还需要判断数据是否过期 需要存储数据的时候 既要存时间也要存数据 
  //        没有过期 正常加载旧数据
  //        过期了  重新发送请求 获取新的数据
  function loadData() {
    // 获取旧的永久存储中的数据 
    var localStr = localStorage.getItem("cates");
    // 判断是否存在 
    if (!localStr) {
      // 发送请求获取新的数据
      getCateItems();
    } else {
      // 获取本地存储中的数据对象
      // {time:1223444,datas:[....]}
      var localData = JSON.parse(localStr);
      // 判断是否到了过期时间 - 自己定义  1000000毫秒
      if (Date.now() - localData.time > 1000000) {
        // 过期了 
        getCateItems();
      } else {
        CateDatas = localData.datas;
        renderLeft();
        // 默认渲染索引为 0 数据  
        renderRight(0);
      }
    }
  }

  // 发送请求获取数据
  function getCateItems() {
    $.get("/categories", function (ret) {
      // $.get("../a.json",function (ret) {
      // 判断状态
      if (ret.meta.status == 200) {
        // 给全局变量赋值
        CateDatas = ret.data;

        //  把数据存入到本地存储 12:00 
        // localStorage.setItem("cates", JSON.stringify(CateDatas));
        var obj = {
          time: Date.now(),
          datas: CateDatas
        }
        localStorage.setItem("cates", JSON.stringify(obj));

        renderLeft();

        // 默认渲染索引为 0 数据  
        renderRight(0);
      }
    })

  }

  // 渲染左侧的菜单
  function renderLeft() {
    var html = template("leftTpl", { arr: CateDatas });
    $(".pyg_menu").html(html);

    // 初始化左侧的滚动条
    LeftScorll = new IScroll(".left_box");

  }
  // 渲染右侧的内容
  function renderRight(index) {
    var cates0 = CateDatas[index].children;
    var html2 = template("rightTpl", { arr: cates0 });
    // 先隐藏 马上添加淡入
    $(".right_box").html(html2).hide().fadeIn();

    // 初始化滚动条  存在bug
    // 图片 img 
    //  图片的结构生成了 图片的内容一定有了吗   图片就一定有高度了！！！！
    //   必须要等到最后一张的图片加载完了  再去初始化！！！ 
    //  最后一张的加载完的图片 跟顺序 没有关系 

    // 获取到图片的个数
    var nums = $(".right_box img").length;

    // 图片内容加载完毕事件 
    $(".right_box img").on("load", function () {
      nums--;
      if (nums == 0) {
        console.log("初始化了n次");
        new IScroll(".right_box");
      }
    })

  }
  // 动态设置html标签的字体大小
  function setHtmlFont() {
    /* 
1 基础值 100px
2 设计稿的宽度 375px
3 要适配的屏幕的宽度 = 当前屏幕的宽度
4 动态去设置 html标签的fontsize 
5 公式 ：
    基础值 / 设计稿的宽度 = fz / 当前屏幕的宽度 
    fz=   基础值 / 设计稿的宽度 * 当前屏幕的宽度 ;
 */
    // 基础值
    var baseVal = 100;
    // 设计稿的宽度
    var pageWidth = 375;
    // 当前屏幕的宽度
    var screenWidth = window.screen.width;
    // 要设置的fontsize
    var fz = baseVal / pageWidth * screenWidth;
    // 设置到html标签里面
    $("html").css("fontSize", fz);
  }
})


