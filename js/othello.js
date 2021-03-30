function othelloClass() {
  let turnFlag = '';
  let changeFlag = '';
  let passFlag = '';
  let endFlag = true;
  return {
    //board初期化
    init: function(selector) {
      turnFlag = 'black';
      passFlag = [];
      $(selector + ' > *').remove();
      return true;
    },
    //オセロのマス作成
    initBoard: function(selector, val) {
      for(let i = 0; i < val; i++) {
        for(let j = 0; j < val; j ++) {
          $(selector).append('<div id="' + j + '_' + i + '" class="boardParts"</div>');
        }
      }
      return true;
    },
    //石を初期配置
    initSetStone: function(val) {
      let x1, y1;
      let x2, y2;
      if(val % 2 == 0 && val > 2) {
        x1 = y1 = val / 2;
        x2 = y2 = (val / 2) - 1;
        $('#' + x2 + '_' + y2 + ', #' + x1 + '_' + y1).append('<div class="stone white"></div>');
        $('#' + x2 + '_' + y1 + ', #' + x1 + '_' + y2).append('<div class="stone black"></div>');
        return true;
      } else {
        return false;
      }
    },
    //オセロスタート処理
    start: function(selector, val) {
      endFlag = true;
      this.init(selector);
      this.initBoard(selector, val);
      let ret = this.initSetStone(val);
      if(ret == false) {
        return alert('番目の数を増やしてください。');
      }
      this.addEvent();
      return true;
    },
    //石を置く
    putStone: function(selector, color) {
      let target = $('#' + selector);
      if(target.children().length > 0) {
        target.children().remove();
      }
      target.append('<div class="stone ' + color + '"></div>');
      return true;
    },
    //クリックしたセレクタを加工
    splitSelector: function(id) {
      let rows = id.split('_');
      return {x: parseInt(rows[0]), y: parseInt(rows[1])};
    },
    //石が置けるマスかチェックし、相手の石のマス番を返す
    checkPutStone: function(x, y) {
      let xArr = [];
      let yArr = [];
      if(x == 0) {
        xArr[0] = x;
        xArr[1] = x + 1;
      } else if(x == 7) {
        xArr[0] = x - 1;
        xArr[1] = x;
      } else {
        xArr[0] = x - 1;
        xArr[1] = x;
        xArr[2] = x + 1;
      }
      if(y == 0) {
        yArr[0] = y;
        yArr[1] = y + 1;
      } else if(y == 7) {
        yArr[0] = y - 1;
        yArr[1] = y;
      } else {
        yArr[0] = y - 1;
        yArr[1] = y;
        yArr[2] = y + 1;
      }
      let cnt = 0;
      let result = [];
      for(let i = 0; i < xArr.length; i++) {
        for(let j = 0; j < yArr.length; j++) {
          let ret = this.checkStone(xArr[i], yArr[j]);
          if(ret != false && ret != turnFlag) {
            result.push({x: xArr[i], y: yArr[j]});
            cnt++;
          }
        }
      }
      return result;
    },
    //x・yを元にそのマスが空か白か黒かチェックする
    checkStone: function(x, y) {
      let target = $('#' + x + '_' + y).children();
      if(target.length > 0) {
        return target.attr('class').replace('stone', '').replace(' ', '');
      } else {
        return false;
      }
    },
    //置き石及び隣接石を元に返せる石かチェック
    checkReverseStone: function(obj, arr) {
      let Stones = [], subX, subY;
      for(let i = 0; i < arr.length; i++) {
        if((arr[i].x - obj.x) == 1) {
          subX = 1;
        } else if((arr[i].x - obj.x) == 0) {
          subX = 0;
        } else {
          subX = -1;
        }
        if((arr[i].y - obj.y) == 1) {
          subY = 1;
        } else if((arr[i].y - obj.y) == 0) {
          subY = 0;
        } else {
          subY = -1;
        }
        let flag = true;
        let x = arr[i].x;
        let y = arr[i].y;
        let tempStones = [];
        tempStones.push({x: x, y: y});
        while(flag) {
          x += subX;
          y += subY;
          if(0 <= x && x < 8 && 0 <= y && y < 8) {
            let stoneColor = this.checkStone(x, y);
            if(stoneColor != false) {
              if(stoneColor != turnFlag) {
                tempStones.push({x: x, y: y});
              } else {
                for(let j = 0; j < tempStones.length; j++) {
                  Stones.push({x: tempStones[j].x, y: tempStones[j].y});
                }
                flag = false;
              }
            } else {
              flag = false;
            }
          } else {
            flag = false;
          }
        }
      }
      return Stones;
    },
    //石を置く・裏返し・フラグを立てる
    turnOverStones: function(obj, Stones) {
      changeFlag = false;
      if(Stones.length != 0) {
        this.putStone(obj.x + '_'  + obj.y, turnFlag);
        for(let i = 0; i < Stones.length; i++) {
          let selector = Stones[i].x + '_' + Stones[i].y;
          this.putStone(selector, turnFlag);
        }
        changeFlag = true;
        return true;
      }
      return false;
    },
    //turnFlagを変更する
    changeTurnFlag: function(val) {
      switch(val) {
        case 'black':
          turnFlag = 'white';
          break;
        case 'white':
          turnFlag = 'black';
          break;
      }
      return true;
    },
    //PLAYER処理
    turnPLAYER: function(id) {
      let obj = this.splitSelector(id);
      let result = this.checkPutStoneOrPass('black');
      if(result == 'end') {
        this.endProcess();
        return true;
      } else if(result == 'pass') {
        this.passProcess(turnFlag);
        return true;
      } else {
        let clickFlag = this.checkStone(obj.x, obj.y);
        if(turnFlag == 'black') {
          if(clickFlag == false) {
            let arr = this.checkPutStone(obj.x, obj.y);
            if(arr.length > 0) {
              let Stones = this.checkReverseStone(obj, arr);
              this.turnOverStones(obj, Stones);
              if(changeFlag) {
                this.changeTurnFlag(turnFlag);
                this.turnCPU();
              }
              return true;
            }
          } else {

          }
        } else {

        }
      }
      return false;
    },
    //CPU処理
    turnCPU: function() {
      let result = this.checkPutStoneOrPass('white');
      if(result == 'end') {
        this.endProcess();
      } else if(result == 'pass') {
        this.passProcess(turnFlag);
      } else {
        this.turnOverStones(result.obj, result.Stones);
        if(changeFlag) {
          this.changeTurnFlag(turnFlag);
        }
        let player = this.checkPutStoneOrPass('black');
        if(player == 'end') {
          this.endProcess();
        } else if(player == 'pass') {
          this.passProcess(turnFlag);
          this.changeTurnFlag(turnFlag);
          this.turnCPU();
        }
      }
      return true;
    },
    //石を置けるかどうかの確認
    checkPutStoneOrPass: function(playerOrEnemy) {
      let stoneX;
      let stoneY;
      let Stones = [];
      let cnt = 0;
      let emptyCnt = 0;
      for(let i = 0; i < 8; i++) {
        for(let j = 0; j < 8; j++) {
          let clickFlag = this.checkStone(i, j);
          if(turnFlag == playerOrEnemy) {
            if(clickFlag == false) {
              let arr = this.checkPutStone(i, j);
              if(arr.length > 0) {
                let base = {x: i, y: j};
                let tempStones = [];
                tempStones = this.checkReverseStone(base, arr);
                if(tempStones.length > cnt) {
                  stoneX = base.x;
                  stoneY = base.y;
                  Stones = [];
                  Stones = tempStones;
                  cnt = Stones.length;
                }
              }
              emptyCnt++;
            }
          }
        }
      }
      if(cnt > 0) {
        passFlag['black'] = 0;
        passFlag['white'] = 0;
        return {obj: {x: stoneX, y: stoneY}, Stones: Stones};
      } else {
        if(emptyCnt > 0) {
          return 'pass';
        } else {
          return 'end';
        }
      }
    },
    //パスの処理
    passProcess: function(turn) {
      if(passFlag[turn] != 1) {
        passFlag[turn] = 1;
      }
      if(passFlag['black'] == 1 && passFlag['white'] == 1) {
        this.endProcess();
      } else {
        this.changeTurnFlag(turnFlag);
      }
      return true;
    },
    //終了処理
    endProcess: function() {
      setTimeout(function(){
        if(changeFlag) {
          let blackCnt = $('.black').length;
          let whiteCnt = $('.white').length;
          let WINNER;
          if(blackCnt != whiteCnt) {
            if(blackCnt > whiteCnt) {
              WINNER = 'あなた';
            } else {
              WINNER = 'CPU';
            }
            if (endFlag) {
              alert(blackCnt + ':' + whiteCnt + 'で' + WINNER + 'の勝ち！！');
              endFlag = false;
            }
          } else {
            if (endFlag) {
              alert('引き分けです。');
              endFlag = false;
            }
          }
          return true;
        }
      }, 1000);
    },
    addEvent: function() {
      let obj = this;
      $(document).on('click', '.boardParts', function() {
        obj.turnPLAYER($(this).attr('id'));
      });
    }
  }
}
