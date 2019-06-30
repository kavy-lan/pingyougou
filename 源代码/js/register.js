$(function () {
  /* 
  1 验证码按钮
    1 获取手机号码 合法性验证 
      非法  给出用户提示
    2 发送请求到后台
      失败 ->
      成功 ->  
        真实:后台负责发送验证 到用户的手机  
        1 禁用按钮 
        2 开启倒数计时 
          动态改变按钮的文本 
        3 时间到了
          1 清除定时器
          2 重新把按钮的文本 重置 


  2 注册按钮
    1 获取一堆输入框的值
      挨个做验证 
    2 构造参数 发送到后台 执行注册了
       注册失败 =>  手机号码已经注册了!!!1
        给出用户提示 
       注册成功
        1 给出提示 
        2 等待一会再跳转页面 => 登录页面 
   */


  init();
  function init() {
    eventList();
  }
  function eventList() {
    // 获取验证码
    $("#vcode_btn").on("tap", function () {
      // 获取手机号码
      var mobile_txt = $("[name='mobile']").val().trim();
      if (!$.checkPhone(mobile_txt)) {
        // 非法
        mui.toast("手机非法");
        return;
      }

      // 禁用 动态给dom元素添加属性
      // $("#vcode_btn").attr("disabled","disabled");
      // $("#vcode_btn").removeAttr("disabled");

      // 发送请求到后台
      $.post("/users/get_reg_code", {
        mobile: mobile_txt
      }, function (ret) {
        // 判断成功
        if (ret.meta.status == 200) {

          // 开发人偷懒 直接设置值
          $("[name='code']").val(ret.data);

          // 禁用按钮
          $("#vcode_btn").attr("disabled", "disabled");
          // 倒计时的时间
          var times = 60;
          // 改变按钮的文本  0秒再去获取
          $("#vcode_btn").text(times + "秒再去获取");

          // 开启定时器
          var timeId = setInterval(function () {
            times--;
            $("#vcode_btn").text(times + "秒再去获取");

            // 时间到了
            if (times == 0) {
              // 暂停定时器
              clearInterval(timeId);
              // 重置按钮 移除禁用 改变文本
              $("#vcode_btn").removeAttr("disabled");
              $("#vcode_btn").text("获取验证码");
            }

          }, 1000);


        }
      })
    })

    // 点击注册
    $("#register_btn").on("tap", function () {
      // console.log("海边,不能讲笑话!!!?    海啸=海笑!!!");
      // console.log("穿山甲 一直在钻地 ?   因为它在找一个人 穿山乙   ");

      /* 
      1 获取输入框的值
      2 挨个去做判断
        1 手机号码
        2 验证码 前端只判断 code_txt 长度 是否=4 
        3 邮箱 通过正则 来验证 
        4 密码  长度 最少 6位数 
      3 发送成功  
        1 但是注册失败 失败
          1 给出用户提示  后台一般会提供的详细的失败的信息
        2 成功
          1 给出一个提示
          2 等待一会 再跳转页面 -> 登录页面 
       */
      var mobile_txt = $("[name='mobile']").val().trim();
      var code_txt = $("[name='code']").val().trim();
      var email_txt = $("[name='email']").val().trim();
      var pwd_txt = $("[name='pwd']").val().trim();
      var pwd_txt2 = $("[name='pwd2']").val().trim();
      // 获取单选框的值 
      var gender_txt = $("[name='gender']:checked").val();


      // js 打断点!!!!
      // debugger
      // 判断手机号码
      if (!$.checkPhone(mobile_txt)) {
        // 非法
        mui.toast("手机非法");
        return;
      }

      // 判断验证码的长度
      if (code_txt.length != 4) {
        mui.toast("验证码格式不对")
        return;
      }

      // 验证邮箱
      if (!$.checkEmail(email_txt)) {
        mui.toast("邮箱不合法")
        return;
      }

      // 验证密码
      if (pwd_txt.length < 6) {
        mui.toast("密码的格式不对")
        return;
      }

      // 重复密码
      if (pwd_txt != pwd_txt2) {
        mui.toast("两次密码不一致")
        return;
      }

      // console.log("发送注册");

      // 注册信息参数
      var params = {
        mobile: mobile_txt,
        code: code_txt,
        email: email_txt,
        pwd: pwd_txt,
        gender: gender_txt
      };

      // 发送请求 /users/reg
      $.post("/users/reg", params, function (ret) {

        // 成功
        if (ret.meta.status == 200) {
          mui.toast(ret.meta.msg);
          setTimeout(function () {
            location.href = "login.html";

          }, 1000);
        }else{
          // 失败
          mui.toast(ret.meta.msg);
        }

      })

    })
  }
})