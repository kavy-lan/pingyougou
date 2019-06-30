$(function () {
  init();
  function init() {
    eventList();
  }

  function eventList() {
    // 登录按钮
    $("#login_btn").on("tap", function () {
      /* 
      1 获取值 判断合法性
      2 失败  给出提示
      3 成功
        1 保存数据到本地存储中
          1 把data中的数据直接保存下来
            用哪个存储 会话存储 
            保存的数据 复杂类型的对象 不是简单的字符串
        2 跳转页面
          1 如果有来源页面 就跳去来源页面
            1 在来源页面中
              在跳转之前 存一个路径到 会话存储中

          2 么有 跳转到首页!!
      

       */


       var username_txt=$("[name='username']").val().trim();
       var password_txt=$("[name='password']").val().trim();


       if(!$.checkPhone(username_txt)){
         mui.toast("用户名不合法")
         return;
       }
       if(password_txt.length<6){
         mui.toast("密码不合法")
         return;
       }

       // 发送请求到后台
       $.post("/login",{
         username:username_txt,
         password:password_txt
       },function (ret) {
         console.log(ret);
        if(ret.meta.status==200){
          // 存用户信息到会话存储中
          // sessionStorage.setItem("userinfo",JSON.stringify(ret.data));
          $.setUser(ret.data);

          // 执行跳转页面
          var page=$.getPage();
          if(page){
            location.href=page;
          }else{
            location.href="../index.html";
          }
        }else{
          mui.toast(ret.meta.msg);
        }
         
       })
    })
  }

})