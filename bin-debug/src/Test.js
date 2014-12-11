var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/**
 * Created by yang on 14/12/11.
 */
var Test = (function (_super) {
    __extends(Test, _super);
    function Test() {
        _super.call(this);
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }
    Test.prototype.onAddToStage = function (event) {
        var shp = new egret.Shape();
        shp.graphics.beginFill(0xff0000);
        shp.graphics.drawRect(0, 0, 100, 100);
        shp.graphics.endFill();
        this.addChild(shp);
        var shp2 = new egret.Shape();
        shp2.graphics.beginFill(0x00ff00);
        shp2.graphics.drawCircle(0, 0, 20);
        shp2.graphics.endFill();
        this.addChild(shp2);
        shp2.x = 20;
        shp2.y = 20;
        var rect = new egret.Rectangle(20, 20, 30, 50);
        shp.mask = rect;
    };
    return Test;
})(egret.DisplayObjectContainer);
Test.prototype.__class__ = "Test";
//# sourceMappingURL=Test.js.map