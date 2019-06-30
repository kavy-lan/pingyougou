$(function () {
  init();
  function init() {
    var user = $.getUser();
    if (!user) {
      // 把当前页面存到 会话存储中
      $.setPage();
      location.href = "login.html";
      return;
    }
    // 显示购物车页面
    $("body").fadeIn();

    
    queryOrders();
  }

  // 获取订单数据
  // /my/orders/all

  function queryOrders() {
    $.get("/my/orders/all",{
      type:$.getUrl("type")||1 
    },function (ret) {
      // console.log(ret);
      if(ret.meta.status==200){
        var html=template("mainTpl",{arr:ret.data});
        $(".item_list").html(html);
      }else{
        console.log(ret);
      }
      
    })
    
  }
  
})