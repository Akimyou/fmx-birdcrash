
/*左右边有三个方向可以走*/
var l_choices = [
    [
        [0, -1],
        [1, -1],
        [-1, -1]
    ],
    [
        [0, -1],
        [1, 0],
        [-1, 0]
    ]
];

var r_choices = [
    [
        [0, 1],
        [1, 0],
        [-1, 0]
    ],
    [
        [0, 1],
        [1, 1],
        [-1, 1]
    ]
];

/*上下可以分两个方向走*/
var t_choices = [
    [
        [1, -1],
        [1, 0]
    ],
    [
        [1, 0],
        [1, 1]
    ]
];

var b_choices = [
    [
        [-1, -1],
        [-1, 0]
    ],
    [
        [-1, 0],
        [-1, 1]
    ]
];

var ROW_MINUS_1 = ROW-1, COL_MINUS_1 = COL-1;
/*
*    最重要的是getdistance这个函数
*     6个参数的含义是player的行号，player的列号，他前进的方向I R T B
*           4.激活块的记录数组
  *          5. 记录数组，记录已经访问过的节点
      *         6. 最短路径
      *         返回值也有三种
       *        player到达边界，player坐标和最短路径为0
                player在地图 ，返回player的下一个坐标值和最短路径cost
                  player被圈住了，但是可以移动，-1
                  *
                           *
       *                      */
var getDistance = function (r, c, dir_choices, activate_blocs, passed, cost) {
    passed[r][c] = true;
      cc.log("hhhh");
         //到达边界了，判定简单，那就会返回一个player的坐标和最短路径0；
    if (r <= 0 || r >= ROW_MINUS_1 || c <= 0 || c >= COL_MINUS_1) {
        return [r, c, cost];
    }
    //根据排数奇偶数来选择使用的数组
    var odd = (r % 2 == 1) ? 1 : 0;

    var choices = dir_choices[odd];

    var nextr, nextc, result;

    for (var i = 0, l = choices.length; i < l; i++) {
        nextr = r + choices[i][0];
        nextc = c + choices[i][1];

        if (!activate_blocs[nextr][nextc] && !passed[nextr][nextc]) {
            //计算最短路径
            cost ++;
            //递归调用getDistance  http://www.zhihu.com/question/20507130
            result = getDistance(nextr, nextc, dir_choices, activate_blocs, passed, cost);

            if (result != -1) {
                result[0] = nextr;
                result[1] = nextc;
                return result;
            }
        }
    }
    return -1;
};