$(function () {
  /* 
  1 动态的数据 从哪里来?? 肯定 接口获取   http://api.pyg.ak48.xyz/api/public/v1/goods/search
    1 需要用到的参数  把他们变成一个全局变量!!! 
      query	查询关键词	  空字符  
      cid	分类ID	可选  从分类页面中 点击到某个商品的时候 带过来!!! 
          需要从url上获取的!!!
      pagenum	页数索引	可选默认第一页  自定义
      pagesize	每页长度	可选默认20条 自定义 
    2 在mui的下拉 callback中 发送请求 渲染数据

  2 渲染数据
      下拉刷新 可以   应该是和重新打开页面的效果是一样的!! 
      cid= 5
      pagenum=1 
       $().html() 
      加载下一页   
       $().append() 
       1  加载新的数据之前 需要判断还有没有下一页的数据
          有 直接加载新数据
          没有 给出提示 已经加载完了....
       2 如何判断还有没有下一页的数据
        总的页数 = Math.ceil( 总的条数(数据库里面一共的数据量) / 页容量(一页里面有几条数据))
        总条数 total :101
        页容量 pagesize : 10
        总页数 : = Math.ceil(101/10)=11 

        当前页码 和 总页数 比较 
      
   */


  // 全局查询的参数
  var QueryObj = {
    query: "",
    cid: $.getUrl("cid"),
    pagenum: 1,
    pagesize: 10
  };

  // 总页数
  var totalPage = 1;


  init();

  function init() {
    eventList();
    mui.init({
      pullRefresh: {
        container: ".pyg_view",
        // 下拉
        down: {
          // 打开页面 自动显示 下拉刷新组件
          auto: true,
          //  触发下拉刷新时自动触发
          callback: function () {
            // 重置参数
            QueryObj = {
              query: "",
              cid: $.getUrl("cid"),
              pagenum: 1,
              pagesize: 10
            };

            // 重置代码放这里 逻辑是可以了  但是 由于框架代码的问题 没有效果 


            searchData(function (data) {
              var html = template("mainTpl", { arr: data });
              // 后期可能需要根据需求-加载下一页 改成 append 
              $(".pyg_list").html(html);
              // 结束下拉刷??  后面可能需要根据需求来决定 结束 下拉刷新组件 还是上拉加载下一页的组件
              mui('.pyg_view').pullRefresh().endPulldownToRefresh();


              // 也需要重置组件!!!  代码放这个位置可能没有效果??....
              // 经过你们项目组长 研究代码 发现 
              // 放这个就可以了 
              mui('.pyg_view').pullRefresh().refresh(true);
            });

          }
        }
        ,
        // 上拉
        up: {
          //  触发上拉刷新时自动触发
          callback: function () {
            // console.log("触发了上拉加载下一页");

            // 先判断还有没有下一页
            if (QueryObj.pagenum >= totalPage) {
              // 没数据 给出用户提示 
              console.log("没有数据了");
              // 结束上拉加载更多 如果没有数据 传入 true 否则 传入 false
              mui('.pyg_view').pullRefresh().endPullupToRefresh(true);
            } else {
              // 还有数据
              QueryObj.pagenum++;
              searchData(function (data) {

                var html = template("mainTpl", { arr: data });
                // 追加
                $(".pyg_list").append(html);
                // 结束上拉加载
                // 结束上拉加载更多 如果没有数据 传入 true 否则 传入 false
                mui('.pyg_view').pullRefresh().endPullupToRefresh(false);

              });
            }
          }
        }
      }
    });

  }

  // 绑定事件
  function eventList() {
    $("body").on("tap", "a", function () {
      // 我错了...
      var href = this.href;
      location.href = href;

    })

  }

  // 获取商品列表数据
  function searchData(callback) {
    // $.get("url",参数对象?,回调函数)
    $.get("/goods/search", QueryObj, function (ret) {
      // console.log(ret);
      // 判断状态
      if (ret.meta.status == 200) {
        // 计算总页数
        // 总的页数 = Math.ceil( 总的条数(数据库里面一共的数据量) / 页容量(一页里面有几条数据))
        totalPage = Math.ceil(ret.data.total / QueryObj.pagesize);
        console.log(totalPage);

        console.log("数据回来了");
        callback(ret.data.goods);



      }

    })
  }

 
})