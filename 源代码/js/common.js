$(function () {

  // 基础的路径
  var baseURL = "http://api.pyg.ak48.xyz/api/public/v1";

  var times = 0;

  // 只要发送了ajax请求 就会被调用 -发送前被调用 
  $.ajaxSettings.beforeSend = function (xhr, obj) {
    //  console.log("before 拦截器");

    // 添加正在等待
    $("body").addClass("loadding");

    times++;

    // 修改url
    obj.url = baseURL + obj.url;

    // 对路径做判断 
    // 公开的路径  不处理
    // 私人的路径 需要添加请求头!!!
    // string.indexOf("需要需找的字符串")
    // 如果找不到 返回 -1 
    if (obj.url.indexOf("/my/") != -1) {
      // 处理头部
      // 添加headers  没有效果
      //  obj.headers={
      //   "Authorization":123344
      //  };
      // xhr 原生的ajax对象 里面有一个设置请求头的方法
      // console.log(xhr);
      // 获取token
      var token = JSON.parse($.getUser()).token;
      xhr.setRequestHeader("Authorization", token);

    }



  }
  // 请求回来之后 会自动调用 
  // 要求同时发送出去的请求 要求都结束 了再去隐藏正在等待类
  $.ajaxSettings.complete = function () {
    // console.log("complete 拦截器");

    times--;
    if (times == 0) {
      // 移除正在等待
      $("body").removeClass("loadding");
    }
  }

  // 拓展zepto 添加自定义的方法 
  $.extend($, {
    getUrl: function (name) {
      // 获取url上的参数
      var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
      var r = window.location.search.substr(1).match(reg);
      if (r != null) return decodeURI(r[2]);
      return null;
    },
    checkPhone: function (phone) {
      // 验证手机号码是否合法
      if (!(/^1[34578]\d{9}$/.test(phone))) {
        return false;
      } else {
        return true;
      }

    },
    checkEmail: function (myemail) {
      // 验证邮箱
      var myReg = /^[a-zA-Z0-9_-]+@([a-zA-Z0-9]+\.)+(com|cn|net|org)$/;
      if (myReg.test(myemail)) {
        return true;
      } else {
        return false;
      }
    },
    setUser: function (obj) {
      // 把用户信息存储到会话存储中
      sessionStorage.setItem("userinfo", JSON.stringify(obj));
    },
    getUser: function () {

      return sessionStorage.getItem("userinfo");
    },
    getPage: function () {
      // 获取来源页面
      return sessionStorage.getItem("pageName");

    },
    setPage: function () {
      // 存储来源页面
      sessionStorage.setItem("pageName", location.href);
    }
  })

})


