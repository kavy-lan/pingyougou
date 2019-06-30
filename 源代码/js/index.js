$(function () {
  init();
  function init() {

    getSwiperdata();
    getCatitems();
    getGoodslist();

  }

  // 获取轮播图的数据
  function getSwiperdata() {
    // http://api.pyg.ak48.xyz/api/public/v1/home/swiperdata
    $.get("/home/swiperdata", function (ret) {

      // 判断是否正确
      if (ret.meta.status == 200) {
        // 开始渲染数据
        var html = template("swiDataTpl", { arr: ret.data });
        $(".pyg_slides .mui-slider").html(html);

        //  初始化轮播
        var gallery = mui('.mui-slider');
        gallery.slider({
          interval: 5000//自动轮播周期，若为0则不自动播放，默认为0；
        });
      } else {
        console.log(ret);
      }

    })
  }

  // 获取首页导航
  function getCatitems() {
    $.get("/home/catitems", function (ret) {
      // console.log(ret);

      // 判断状态
      if (ret.meta.status == 200) {
        var html = template("navTpl", { arr: ret.data });
        $(".pyg_nav").html(html);
      } else {
        console.log(ret);
      }

    })

  }

  // 获取商品列表
  function getGoodslist() {
    $.get("/home/goodslist", function (ret) {
      if (ret.meta.status == 200) {
        // 开始渲染
        var html = template("goodsTpl", { arr: ret.data });
        $(".pyg_list").html(html);
        // 初始化懒加载
        mui(document).imageLazyload({
          placeholder: '../static/images/60x60.gif'
       });
      } else {
        console.log(ret);
      }
    })
  }
})