$(function () {
  /* 
  1 根据url上的商品 id 去发送请求加载数据
    1 获取url上id
    2 再去发送请求
  
   */

  // 全局 商品的信息对象
  var GoodsItem;

  init();
  function init() {

    eventList();
    getDetail();
  }


  function eventList() {
    $(".add_btn").on("tap", function () {


      /* 
      1 判断是否已经登录
        未登录  
          给提示 存页面 跳转 
        登录过了
          构造参数 发送请求
       */
      // 在登录成功的时候存储好了  userinfoStr 是个json字符串 还不是一个对象
      var userinfoStr = $.getUser();
      if (!userinfoStr) {
        mui.toast("未登录")
        setTimeout(function () {
          // 把当前的路径存到会话存储中
          // sessionStorage.setItem("pageName", location.href);
          $.setPage();
          location.href = "login.html";
        }, 1000);
      } else {
        console.log(GoodsItem);

        // 构造请求的参数
        var params = {
          cat_id: GoodsItem.cat_id,
          // 必须要补上的
          goods_id: GoodsItem.goods_id,
          goods_name: GoodsItem.goods_name,
          goods_number: GoodsItem.goods_number,
          goods_price: GoodsItem.goods_price,
          goods_small_logo: GoodsItem.goods_small_logo,
          goods_weight: GoodsItem.goods_weight
        };

        // 因为添加到购物车 需要用户令牌 
        // 接口规定 需要把token放置请求头里面 
        // 如果使用 $.get $.post 不好去设置请求头(没有提供参数给你去设置)
        // $.ajax 就可以很方便的设置请求头

        // 是否需要对userinfo 做个判断 是否存在 ???
        $.post("/my/cart/add", {
          info: JSON.stringify(params)
        }, function (ret) {
          console.log(ret);
          if (ret.meta.status == 200) {
            // mui的 官网 消息框
            mui.confirm("是否要跳转到购物车?", "添加成功", ["跳转", "取消"], function (etype) {
              // arguments   可以获取方法上的参数

              if (etype.index == 0) {
                // 跳转
                location.href = "cart.html";
              } else if (etype.index == 1) {
                // 取消 什么都不做
              }
            });
          } else {
            // token过期了 ......
            mui.toast(ret.meta.msg);
          }

        })


        // var token = JSON.parse(userinfoStr).token;
        // $.ajax({
        //   url: "/my/cart/add",
        //   type: "post",
        //   data: {
        //     info: JSON.stringify(params)
        //   },
        //   headers: {
        //     "Authorization": token
        //   },
        //   success: function (ret) {
        //     console.log(ret);
        //     if (ret.meta.status == 200) {
        //       // mui的 官网 消息框
        //       mui.confirm("是否要跳转到购物车?", "添加成功", ["跳转", "取消"], function (etype) {
        //         // arguments   可以获取方法上的参数

        //         if (etype.index == 0) {
        //           // 跳转
        //           location.href = "cart.html";
        //         } else if (etype.index == 1) {
        //           // 取消 什么都不做

        //         }
        //       });
        //     } else {
        //       // token过期了 ......
        //       mui.toast(ret.meta.msg);
        //     }
        //   }

        // });

        // $.post("/my/cart/add",{
        //   info:JSON.stringify(params)
        // },function (ret) {
        //   console.log(ret);
        //   if(ret.meta.status==200){
        //     mui.toast("添加成功")
        //   }else{
        //     // token过期了 ......
        //     mui.toast(ret.meta.msg);
        //   }

        // })


      }

    })

  }

  // 获取商品的详情数据
  // goods/detail
  function getDetail() {
    $.get("/goods/detail", {
      goods_id: $.getUrl("goods_id")
    }, function (ret) {
      // console.log(ret);
      if (ret.meta.status == 200) {

        // 保存商品对象到全局变量中
        GoodsItem = ret.data;

        var html = template("mainTpl", ret.data);
        $(".pyg_view").html(html);

        // 轮播图的初始化 如果图片是动态生成 后期需要等到渲染完之后 再去初始化 
        var gallery = mui('.mui-slider');
        gallery.slider({
          interval: 5000//自动轮播周期，若为0则不自动播放，默认为0；
        });

      }

    })

  }


})