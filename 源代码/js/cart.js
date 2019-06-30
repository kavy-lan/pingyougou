$(function () {
  /* 
  1 权限验证!!!
    用户未登录 跳转到登录页面
      1 判断会话存储中 有没有用户的信息 
    用户已经登录 正常执行
  2 加载购物车页面的数据

   */

  init();
  function init() {
    // 权限验证

    var user = $.getUser();
    if (!user) {
      // 把当前页面存到 会话存储中
      $.setPage();
      location.href = "login.html";
      return;
    }
    // 显示购物车页面
    $("body").fadeIn();
    queryCart();

    eventList();
  }

  // 查询购物车数据
  // http://api.pyg.ak48.xyz/api/public/v1/my/cart/all
  function queryCart() {
    $.get("/my/cart/all", function (ret) {

      console.log(ret);
      if (ret.meta.status == 200) {
        var cart_info = JSON.parse(ret.data.cart_info);
        console.log(cart_info);
        var html = template("mainTpl", { obj: cart_info })
        $(".goods_wrap").html(html);

        // 初始化数字输入框
        mui(".mui-numbox").numbox();

        countCart();
      }



    })
    // return;
    // $.ajax({
    //   url: "/my/cart/all",
    //   // headers: {
    //   //   "Authorization": token
    //   // },
    //   success: function (ret) {
    //     console.log(ret);
    //     if (ret.meta.status == 200) {
    //       var cart_info = JSON.parse(ret.data.cart_info);
    //       console.log(cart_info);
    //       var html=template("mainTpl",{obj:cart_info})
    //       $(".goods_wrap").html(html);

    //       // 初始化数字输入框
    //       mui(".mui-numbox").numbox();
    //     }

    //   }
    // });

  }


  // 绑定事件
  function eventList() {
    // 编辑按钮
    $("#edit_btn").on("tap", function () {
      // console.log("菜放太多盐 怎么办??   放一段时间就可以了  因为时间可以冲淡一切 ");



      // 给body标签的class做判断 
      // 有  editting 显示的是完成
      // 没有   显示的编辑
      if ($("body").hasClass("editting")) {
        $("#edit_btn").text("编辑");

        // 执行编辑
        editGoods();
      } else {
        $("#edit_btn").text("完成");

      }


      $("body").toggleClass("editting");
    })

    // 加减数量的按钮
    $(".goods_wrap").on("tap", ".item_numberbox .mui-btn", function () {

      countCart();
    })

    // 删除按钮
    $("#delete_btn").on("tap", function () {
      /* 
      1 先看有没有选中要删除的选项 
        没有  不处理 或者给出提示
        有 2 ..
      2 弹出确认框 
      */

      // 1 获取   已经勾选了的复选框 
      var length = $(".delete_chk:checked").length;
      if (length == 0) {
        mui.toast("你还么有购买过商品😄");
        return
      }

      // 2 确认框
      mui.confirm("确定要删除吗?", "警告", ["删除", "取消"], function (etype) {
        if (etype.index == 0) {
          // 删除
          // console.log("开始删除");
          /* 
          开始数据 
           {
             111: {cat_id.....},
             222: {cat_id.....},
             333: {cat_id.....},
           }

           执行删除的
             {
             222: {cat_id.....},
             333: {cat_id.....},
           }

           构造的参数
            1 等于 复选框没有勾选过的数据 
            2 发送到后台执行同步就可以了!!!!

            3 获取li标签数组 为被选中的li标签数组??? 
                 先获取未被选择复选框 .parents("li") 
                      
                  $(".delete_chk:checked")
           */
          // 未被选中的li标签数组
          deleteCart();

        } else if (etype.index == 1) {
          // 取消
          console.log("取消");
        }

      })


    })

    // 生成订单
    $("#create_btn").on("tap", function () {
      /* 
      0 判断有没有li标签  
         没有 给出提示 
         有 => 1 
      1 构造参数
       */

      // 要生成订单的li标签
      var $li = $(".goods_wrap li");
      if ($li.length == 0) {
        mui.toast("你还没有选购商品");
        return;
      }

      // 要发送的参数
      var goodsObj = {
        order_price: $(".price").text(),
        consignee_addr: "召唤师峡谷",
        goods: []
      };

      for (var i = 0; i < $li.length; i++) {
        //  js dom元素
        var li = $li[i];
        // var obj = li.dataset.obj;
        // jq 会帮你转类型 但是js dataset 不会 
        var obj = $(li).data("obj");
        var tmpObj = {
          goods_id: obj.goods_id,
          goods_number: $(li).find(".mui-numbox-input").val(),
          goods_price: obj.goods_price
        };

        goodsObj.goods.push(tmpObj);
      }

      // console.log(goodsObj);
      // 开始生成订单
      orderCreate(goodsObj);

    })
  }

  // 计算总价格
  function countCart() {
    /*
    计算总价格需要用两次
      1 在请求后直接计算
      2 数字输入框的按钮触发的 

    肯定需要循环
      循环 请求后的数据   
            更好去获取数据
      循环 li标签  

    0 总的价格
      +=每一个li标签的单价 * li标签里面的数字输入框的值

    1  获取所有的li标签
    2  循环li标签
        1 获取li标签的单价
        2 获取li标签里面的数字输入框的标签的值
        3 总价的价格 += 单价 * 数量 

     */

    // 获取所有的li标签
    // $lis 是一个jq的伪数组 
    var $lis = $(".goods_wrap li");
    // 总的价格
    var total = 0;
    for (var i = 0; i < $lis.length; i++) {
      //  li 是js的对象 dom
      var li = $lis[i];
      //   获取
      //  $(li).data("obj") ==  li.dataset.obj
      // var goodsObj = $(li).data("obj");
      // var  goodsObj=li.dataset.obj;

      // 绑定到li标签上的购物车数据对象
      var goodsObj = $(li).data("obj");
      // 商品的单价
      var price = goodsObj.goods_price;
      // c数量
      var num = $(li).find(".mui-numbox-input").val();
      total += price * num;
    }

    // console.log(total);
    // 设置到标签中
    $(".price").text(total);

  }

  // 删除商品
  function deleteCart() {
    var $unSelectLis = $(".delete_chk").not(":checked").parents("li");
    // console.log($unSelectLis);

    // 需要同步到后台的参数
    var goodsObj = {};
    for (var i = 0; i < $unSelectLis.length; i++) {
      // js的dom对象
      var li = $unSelectLis[i];
      var obj = $(li).data("obj");
      obj.amount = $(li).find(".mui-numbox-input").val();
      goodsObj[obj.goods_id] = obj;
    }
    // 打印不包好有  被删除的数据!!!
    console.log(goodsObj);
    // 同步
    asyncCart(goodsObj);

  }

  // 编辑商品
  function editGoods() {
    /* 
     编辑商品 同步 
     1 后期需要提交到后台的参数 
       {
         商品的id:{等于获取数据的时候 每一个种类的商品的信息},
         商品的id:{等于获取数据的时候 每一个种类的商品的信息},
         商品的id:{等于获取数据的时候 每一个种类的商品的信息}
       }
     2 获取所有的li标签 
         获取li标签身上的商品的对象
         修改商品对象的  数量 => 输入框里面的值 
     3 发送参数到后台 执行 同步购物车 
      */

    // jq 的伪数组
    var $lis = $(".goods_wrap li");
    // 需要构造的参数
    var goodsObj = {};
    for (var i = 0; i < $lis.length; i++) {
      //  li 是一个js的dom元素
      var li = $lis[i];
      // 绑在li标签身上的商品对象
      // var obj=li.dataset.obj;
      var obj = $(li).data("obj");
      // 修改对象的购买数量  =  输入框里面的值
      obj.amount = $(li).find(".mui-numbox-input").val();
      // 把单独的商品的信息拼接到需要同步的参数里面
      // 给对象赋值的方式 一  
      // obj.height=100;
      // 给对象赋值的方式 二
      // obj["height"]=100;

      // obj.13830
      // obj.obj.goods_id
      // obj.weight
      goodsObj[obj.goods_id] = obj;
    }

    // 开始同步数据
    asyncCart(goodsObj);
    // console.clear();
    // console.log(goodsObj);

  }

  // 同步购物车
  function asyncCart(params) {
    $.post("/my/cart/sync", {
      "infos": JSON.stringify(params)
    }, function (ret) {
      // console.log(ret);
      if (ret.meta.status == 200) {
        // 同步成功了 刷新数据
        queryCart();
      } else {
        console.log(ret);
      }

    })
  }

  // 生成订单
  function orderCreate(params) {
    $.post("/my/orders/create", params, function (ret) {
      if (ret.meta.status == 200) {
        // 给出一个确认框  要不要跳到订单页面
        mui.confirm("是否要跳转到订单页面", "生成成功", ["跳转", "取消"], function (etype) {
          var index = etype.index;
          if (index == 0) {
            // 跳
            // console.log("跳转页面");

            location.href="order.html";

          } else if (index == 1) {
            // 不跳
            queryCart();
          }

        })
      } else {
        console.log(ret);
      }

    })

  }
})