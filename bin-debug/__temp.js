/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
/**
 * @namespace egret
 */
var egret;
(function (egret) {
    /**
     * @class egret.HashObject
     * @classdesc
     * @implements egret.IHashObject
     */
    var HashObject = (function () {
        /**
         * @method egret.HashObject#constructor
         * @class egret.HashObject
         * @classdesc 哈希对象。引擎内所有对象的基类，为对象实例提供唯一的hashCode值,提高对象比较的性能。
         */
        function HashObject() {
            this._hashCode = HashObject.hashCount++;
        }
        Object.defineProperty(HashObject.prototype, "hashCode", {
            /**
             * 返回此对象唯一的哈希值,用于唯一确定一个对象。hashCode为大于等于1的整数。
             * @member {number} egret.HashObject#hashCode
             */
            get: function () {
                return this._hashCode;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 哈希计数
         */
        HashObject.hashCount = 1;
        return HashObject;
    })();
    egret.HashObject = HashObject;
    HashObject.prototype.__class__ = "egret.HashObject";
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var egret;
(function (egret) {
    /**
     * @class egret.Recycler
     * @classdesc
     * 对象缓存复用工具类，可用于构建对象池，一段时间后会自动回收对象。
     * @extends egret.HashObject
     */
    var Recycler = (function (_super) {
        __extends(Recycler, _super);
        /**
         * @method egret.Recycler#constructor
         * @param autoDisposeTime {number}
         */
        function Recycler(autoDisposeTime) {
            if (autoDisposeTime === void 0) { autoDisposeTime = 300; }
            _super.call(this);
            this.objectPool = [];
            this._length = 0;
            if (autoDisposeTime < 1)
                autoDisposeTime = 1;
            this.autoDisposeTime = autoDisposeTime;
            this.frameCount = 0;
        }
        Recycler.prototype._checkFrame = function () {
            this.frameCount--;
            if (this.frameCount <= 0) {
                this.dispose();
            }
        };
        Object.defineProperty(Recycler.prototype, "length", {
            /**
             * 缓存的对象数量
             * @member {number} egret.Recycler#length
             */
            get: function () {
                return this._length;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 缓存一个对象以复用
         * @method egret.Recycler#push
         * @param object {any}
         */
        Recycler.prototype.push = function (object) {
            var pool = this.objectPool;
            if (pool.indexOf(object) == -1) {
                pool.push(object);
                this._length++;
                if (this.frameCount == 0) {
                    this.frameCount = this.autoDisposeTime;
                    Recycler._callBackList.push(this);
                }
            }
        };
        /**
         * 获取一个缓存的对象
         * @method egret.Recycler#pop
         * @returns {any}
         */
        Recycler.prototype.pop = function () {
            if (this._length == 0)
                return null;
            this._length--;
            return this.objectPool.pop();
        };
        /**
         * 立即清空所有缓存的对象。
         * @method egret.Recycler#dispose
         */
        Recycler.prototype.dispose = function () {
            if (this._length > 0) {
                this.objectPool = [];
                this._length = 0;
            }
            this.frameCount = 0;
            var list = Recycler._callBackList;
            var index = list.indexOf(this);
            if (index != -1) {
                list.splice(index, 1);
            }
        };
        Recycler._callBackList = [];
        return Recycler;
    })(egret.HashObject);
    egret.Recycler = Recycler;
    Recycler.prototype.__class__ = "egret.Recycler";
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var egret;
(function (egret) {
    egret.__START_TIME;
    /**
     * 用于计算相对时间。此方法返回自启动 Egret 引擎以来经过的毫秒数。
     * @method egret.getTimer
     * @returns {number} 启动 Egret 引擎以来经过的毫秒数。
     */
    function getTimer() {
        return Date.now() - egret.__START_TIME;
    }
    egret.getTimer = getTimer;
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var egret;
(function (egret) {
    egret.__callLaterFunctionList = [];
    egret.__callLaterThisList = [];
    egret.__callLaterArgsList = [];
    /**
     * 延迟函数到屏幕重绘前执行。
     * @method egret.callLater
     * @param method {Function} 要延迟执行的函数
     * @param thisObject {any} 回调函数的this引用
     * @param ...args {any} 函数参数列表
     */
    function callLater(method, thisObject) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        egret.__callLaterFunctionList.push(method);
        egret.__callLaterThisList.push(thisObject);
        egret.__callLaterArgsList.push(args);
    }
    egret.callLater = callLater;
    egret.__callAsyncFunctionList = [];
    egret.__callAsyncThisList = [];
    egret.__callAsyncArgsList = [];
    /**
     * 异步调用函数
     * @method egret.__callAsync
     * @param method {Function} 要异步调用的函数
     * @param thisObject {any} 函数的this引用
     * @param ...args {any} 函数参数列表
     */
    function __callAsync(method, thisObject) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        egret.__callAsyncFunctionList.push(method);
        egret.__callAsyncThisList.push(thisObject);
        egret.__callAsyncArgsList.push(args);
    }
    egret.__callAsync = __callAsync;
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var egret_dom;
(function (egret_dom) {
    egret_dom.header = "";
    /**
     * 获取当前浏览器的类型
     * @returns {string}
     */
    function getHeader() {
        var tempStyle = document.createElement('div').style;
        var transArr = ["t", "webkitT", "msT", "MozT", "OT"];
        for (var i = 0; i < transArr.length; i++) {
            var transform = transArr[i] + 'ransform';
            if (transform in tempStyle)
                return transArr[i];
        }
        return transArr[0];
    }
    egret_dom.getHeader = getHeader;
    /**
     * 获取当前浏览器类型
     * @type {string}
     */
    function getTrans(type) {
        if (egret_dom.header == "") {
            egret_dom.header = getHeader();
        }
        return egret_dom.header + type.substring(1, type.length);
    }
    egret_dom.getTrans = getTrans;
})(egret_dom || (egret_dom = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var egret;
(function (egret) {
    var Event = (function (_super) {
        __extends(Event, _super);
        /**
         * @class egret.Event
         * @classdesc
         * Event 类作为创建 Event 对象的基类，当发生事件时，Event 对象将作为参数传递给事件侦听器。
         *
         * Event 类的属性包含有关事件的基本信息，例如事件的类型或者是否可以取消事件的默认行为。
         *
         * 对于许多事件（如由 Event 类常量表示的事件），此基本信息就足够了。但其他事件可能需要更详细的信息。
         * 例如，与触摸关联的事件需要包括有关触摸事件的位置以及在触摸事件期间是否按下了任何键的其他信息。
         * 您可以通过扩展 Event 类（TouchEvent 类执行的操作）将此类其他信息传递给事件侦听器。
         * Egret API 为需要其他信息的常见事件定义多个 Event 子类。与每个 Event 子类关联的事件将在每个类的文档中加以介绍。
         *
         * Event 类的方法可以在事件侦听器函数中使用以影响事件对象的行为。
         * 某些事件有关联的默认行为，通过调用 preventDefault() 方法，您的事件侦听器可以取消此行为。
         * 可以通过调用 stopPropagation() 或 stopImmediatePropagation() 方法，将当前事件侦听器作为处理事件的最后一个事件侦听器。
         * @param {string} type 事件的类型，可以作为 Event.type 访问。
         * @param bubbles{boolean} 确定 Event 对象是否参与事件流的冒泡阶段。默认值为 false。
         * @param cancelable{boolean} 确定是否可以取消 Event 对象。默认值为 false。
         */
        function Event(type, bubbles, cancelable) {
            if (bubbles === void 0) { bubbles = false; }
            if (cancelable === void 0) { cancelable = false; }
            _super.call(this);
            this._eventPhase = 2;
            this._isDefaultPrevented = false;
            this._isPropagationStopped = false;
            this._isPropagationImmediateStopped = false;
            this.isNew = true;
            this._type = type;
            this._bubbles = bubbles;
            this._cancelable = cancelable;
        }
        Object.defineProperty(Event.prototype, "type", {
            /**
             * 事件的类型。类型区分大小写。
             * @member {string} egret.Event#type
             */
            get: function () {
                return this._type;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Event.prototype, "bubbles", {
            /**
             * 表示事件是否为冒泡事件。如果事件可以冒泡，则此值为 true；否则为 false。
             * @member {boolean} egret.Event#bubbles
             */
            get: function () {
                return this._bubbles;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Event.prototype, "cancelable", {
            /**
             * 表示是否可以阻止与事件相关联的行为。如果可以取消该行为，则此值为 true；否则为 false。
             * @member {boolean} egret.Event#cancelable
             */
            get: function () {
                return this._cancelable;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Event.prototype, "eventPhase", {
            /**
             * 事件流中的当前阶段。此属性可以包含以下数值：
             * 捕获阶段 (EventPhase.CAPTURING_PHASE)。
             * 目标阶段 (EventPhase.AT_TARGET)。
             * 冒泡阶段 (EventPhase.BUBBLING_PHASE)。
             * @member {boolean} egret.Event#eventPhase
             */
            get: function () {
                return this._eventPhase;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Event.prototype, "currentTarget", {
            /**
             * 当前正在使用某个事件侦听器处理 Event 对象的对象。例如，如果用户单击“确定”按钮，
             * 则当前目标可以是包含该按钮的节点，也可以是它的已为该事件注册了事件侦听器的始祖之一。
             * @member {any} egret.Event#currentTarget
             */
            get: function () {
                return this._currentTarget;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Event.prototype, "target", {
            /**
             * 事件目标。此属性包含目标节点。例如，如果用户单击“确定”按钮，则目标节点就是包含该按钮的显示列表节点。
             * @member {any} egret.Event#target
             */
            get: function () {
                return this._target;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 检查是否已对事件调用 preventDefault() 方法。
         * @method egret.Event#isDefaultPrevented
         * @returns {boolean} 如果已调用 preventDefault() 方法，则返回 true；否则返回 false。
         */
        Event.prototype.isDefaultPrevented = function () {
            return this._isDefaultPrevented;
        };
        /**
         * 如果可以取消事件的默认行为，则取消该行为。
         * 许多事件都有默认执行的关联行为。例如，如果用户在文本字段中键入一个字符，则默认行为就是在文本字段中显示该字符。
         * 由于可以取消 TextEvent.TEXT_INPUT 事件的默认行为，因此您可以使用 preventDefault() 方法来防止显示该字符。
         * 注意：当cancelable属性为false时，此方法不可用。
         * @method egret.Event#preventDefault
         */
        Event.prototype.preventDefault = function () {
            if (this._cancelable)
                this._isDefaultPrevented = true;
        };
        /**
         * 防止对事件流中当前节点的后续节点中的所有事件侦听器进行处理。此方法不会影响当前节点 (currentTarget) 中的任何事件侦听器。
         * 相比之下，stopImmediatePropagation() 方法可以防止对当前节点中和后续节点中的事件侦听器进行处理。
         * 对此方法的其它调用没有任何效果。可以在事件流的任何阶段中调用此方法。
         * 注意：此方法不会取消与此事件相关联的行为；有关此功能的信息，请参阅 preventDefault()。
         * @method egret.Event#stopPropagation
         */
        Event.prototype.stopPropagation = function () {
            if (this._bubbles)
                this._isPropagationStopped = true;
        };
        /**
         * 防止对事件流中当前节点中和所有后续节点中的事件侦听器进行处理。此方法会立即生效，并且会影响当前节点中的事件侦听器。
         * 相比之下，在当前节点中的所有事件侦听器都完成处理之前，stopPropagation() 方法不会生效。
         * 注意：此方法不会取消与此事件相关联的行为；有关此功能的信息，请参阅 preventDefault()。
         * @method egret.Event#stopImmediatePropagation
         */
        Event.prototype.stopImmediatePropagation = function () {
            if (this._bubbles)
                this._isPropagationImmediateStopped = true;
        };
        Event.prototype._reset = function () {
            if (this.isNew) {
                this.isNew = false;
                return;
            }
            this._isDefaultPrevented = false;
            this._isPropagationStopped = false;
            this._isPropagationImmediateStopped = false;
            this._target = null;
            this._currentTarget = null;
            this._eventPhase = 2;
        };
        Event._dispatchByTarget = function (EventClass, target, type, props, bubbles, cancelable) {
            if (bubbles === void 0) { bubbles = false; }
            if (cancelable === void 0) { cancelable = false; }
            var recycler = EventClass.eventRecycler;
            if (!recycler) {
                recycler = EventClass.eventRecycler = new egret.Recycler();
            }
            var event = recycler.pop();
            if (!event) {
                event = new EventClass(type);
            }
            else {
                event._type = type;
            }
            event._bubbles = bubbles;
            event._cancelable = cancelable;
            if (props) {
                for (var key in props) {
                    event[key] = props[key];
                    if (event[key] !== null) {
                        props[key] = null;
                    }
                }
            }
            var result = target.dispatchEvent(event);
            recycler.push(event);
            return result;
        };
        Event._getPropertyData = function (EventClass) {
            var props = EventClass._props;
            if (!props)
                props = EventClass._props = {};
            return props;
        };
        /**
         * 使用指定的EventDispatcher对象来抛出Event事件对象。抛出的对象将会缓存在对象池上，供下次循环复用。
         * @method egret.Event.dispatchEvent
         */
        Event.dispatchEvent = function (target, type, bubbles, data) {
            if (bubbles === void 0) { bubbles = false; }
            var eventClass = Event;
            var props = Event._getPropertyData(eventClass);
            if (data) {
                props.data = data;
            }
            Event._dispatchByTarget(eventClass, target, type, props, bubbles);
        };
        /**
         * 在将显示对象直接添加到舞台显示列表或将包含显示对象的子树添加至舞台显示列表中时调度。
         * 以下方法会触发此事件：DisplayObjectContainer.addChild()、DisplayObjectContainer.addChildAt()。
         * @constant {string} egret.Event.ADDED_TO_STAGE
         */
        Event.ADDED_TO_STAGE = "addedToStage";
        /**
         * 在从显示列表中直接删除显示对象或删除包含显示对象的子树时调度。DisplayObjectContainer 类的以下两个方法会生成此事件：removeChild() 和 removeChildAt()。
         * 如果必须删除某个对象来为新对象提供空间，则 DisplayObjectContainer 对象的下列方法也会生成此事件：addChild()、addChildAt() 和 setChildIndex()。
         * @constant {string} egret.Event.REMOVED_FROM_STAGE
         */
        Event.REMOVED_FROM_STAGE = "removedFromStage";
        /**
         * 将显示对象添加到显示列表中时调度。以下方法会触发此事件：
         * DisplayObjectContainer.addChild()、DisplayObjectContainer.addChildAt()。
         * @constant {string} egret.Event.ADDED
         */
        Event.ADDED = "added";
        /**
         * 将要从显示列表中删除显示对象时调度。DisplayObjectContainer 类的以下两个方法会生成此事件：removeChild() 和 removeChildAt()。
         * 如果必须删除某个对象来为新对象提供空间，则 DisplayObjectContainer 对象的下列方法也会生成此事件：addChild()、addChildAt() 和 setChildIndex()。
         * @constant {string} egret.Event.REMOVED
         */
        Event.REMOVED = "removed";
        /**
         * 完成
         * @constant {string} egret.Event.COMPLETE
         */
        Event.COMPLETE = "complete";
        /**
         * 主循环：进入新的一帧
         * @constant {string} egret.Event.ENTER_FRAME
         */
        Event.ENTER_FRAME = "enterFrame";
        /**
         * 主循环：开始渲染
         * @constant {string} egret.Event.RENDER
         */
        Event.RENDER = "render";
        /**
         * 主循环：渲染完毕
         * @constant {string} egret.Event.FINISH_RENDER
         */
        Event.FINISH_RENDER = "finishRender";
        /**
         * 主循环：updateTransform完毕
         * @constant {string} egret.Event.FINISH_UPDATE_TRANSFORM
         */
        Event.FINISH_UPDATE_TRANSFORM = "finishUpdateTransform";
        /**
         * 离开舞台。
         * @constant {string} egret.Event.LEAVE_STAGE
         */
        Event.LEAVE_STAGE = "leaveStage";
        /**
         * 舞台尺寸发生改变
         * @constant {string} egret.Event.RESIZE
         */
        Event.RESIZE = "resize";
        /**
         * 状态改变
         * @constant {string} egret.Event.CHANGE
         */
        Event.CHANGE = "change";
        /**
         * 游戏激活
         * @constant {string} egret.Event.ACTIVATE
         */
        Event.ACTIVATE = "activate";
        /**
         * 取消激活
         * @constant {string} egret.Event.DEACTIVATE
         */
        Event.DEACTIVATE = "deactivate";
        return Event;
    })(egret.HashObject);
    egret.Event = Event;
    Event.prototype.__class__ = "egret.Event";
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var egret;
(function (egret) {
    /**
     * @class egret.HTTPStatusEvent
     * @classdesc
     * 在网络请求返回 HTTP 状态代码时，应用程序将调度 HTTPStatusEvent 对象。
     * 在错误或完成事件之前，将始终发送 HTTPStatusEvent 对象。HTTPStatusEvent 对象不一定表示错误条件；它仅反映网络堆栈提供的 HTTP 状态代码（如果有的话）。
     * @extends egret.Event
     */
    var HTTPStatusEvent = (function (_super) {
        __extends(HTTPStatusEvent, _super);
        /**
         * @method egret.HTTPStatusEvent#constructor
         * @param type {string}
         * @param bubbles {boolean}
         * @param cancelable {boolean}
         */
        function HTTPStatusEvent(type, bubbles, cancelable) {
            if (bubbles === void 0) { bubbles = false; }
            if (cancelable === void 0) { cancelable = false; }
            _super.call(this, type, bubbles, cancelable);
            /**
             * 由服务器返回的 HTTP 状态代码。【只读】
             * @type {number}
             * @private
             */
            this._status = 0;
        }
        Object.defineProperty(HTTPStatusEvent.prototype, "status", {
            get: function () {
                return this._status;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 使用指定的EventDispatcher对象来抛出Event事件对象。抛出的对象将会缓存在对象池上，供下次循环复用。
         * @method egret.IOErrorEvent.dispatchIOErrorEvent
         * @param target {egret.IEventDispatcher}
         */
        HTTPStatusEvent.dispatchHTTPStatusEvent = function (target, status) {
            if (HTTPStatusEvent.httpStatusEvent == null) {
                HTTPStatusEvent.httpStatusEvent = new HTTPStatusEvent(HTTPStatusEvent.HTTP_STATUS);
            }
            HTTPStatusEvent.httpStatusEvent._status = status;
            target.dispatchEvent(HTTPStatusEvent.httpStatusEvent);
        };
        /**
         * HTTPStatusEvent.HTTP_STATUS 常量定义 httpStatus 事件对象的 type 属性值。
         * @constant {string} egret.IOErrorEvent.IO_ERROR
         */
        HTTPStatusEvent.HTTP_STATUS = "httpStatus";
        HTTPStatusEvent.httpStatusEvent = null;
        return HTTPStatusEvent;
    })(egret.Event);
    egret.HTTPStatusEvent = HTTPStatusEvent;
    HTTPStatusEvent.prototype.__class__ = "egret.HTTPStatusEvent";
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var egret;
(function (egret) {
    /**
     * @class egret.IOErrorEvent
     * @classdesc IO流事件，当错误导致输入或输出操作失败时调度 IOErrorEvent 对象。
     * @extends egret.Event
     */
    var IOErrorEvent = (function (_super) {
        __extends(IOErrorEvent, _super);
        /**
         * @method egret.IOErrorEvent#constructor
         * @param type {string}
         * @param bubbles {boolean}
         * @param cancelable {boolean}
         */
        function IOErrorEvent(type, bubbles, cancelable) {
            if (bubbles === void 0) { bubbles = false; }
            if (cancelable === void 0) { cancelable = false; }
            _super.call(this, type, bubbles, cancelable);
        }
        /**
         * 使用指定的EventDispatcher对象来抛出Event事件对象。抛出的对象将会缓存在对象池上，供下次循环复用。
         * @method egret.IOErrorEvent.dispatchIOErrorEvent
         * @param target {egret.IEventDispatcher}
         */
        IOErrorEvent.dispatchIOErrorEvent = function (target) {
            var eventClass = IOErrorEvent;
            egret.Event._dispatchByTarget(eventClass, target, IOErrorEvent.IO_ERROR);
        };
        /**
         * @constant {string} egret.IOErrorEvent.IO_ERROR
         */
        IOErrorEvent.IO_ERROR = "ioError";
        return IOErrorEvent;
    })(egret.Event);
    egret.IOErrorEvent = IOErrorEvent;
    IOErrorEvent.prototype.__class__ = "egret.IOErrorEvent";
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var egret;
(function (egret) {
    var TouchEvent = (function (_super) {
        __extends(TouchEvent, _super);
        /**
         * 创建一个作为参数传递给事件侦听器的 Event 对象。
         *
         * @class egret.TouchEvent
         * @classdesc
         * TouchEvent事件类
         * @extends egret.Event
         * @constructor egret.TouchEvent
         * @param type {string} 事件的类型，可以作为 Event.type 访问。
         * @param bubbles {boolean} 确定 Event 对象是否参与事件流的冒泡阶段。默认值为 false。
         * @param cancelable {boolean} 确定是否可以取消 Event 对象。默认值为 false。
         * @param touchPointID {number}
         * @param stageX {number}
         * @param stageY {number}
         * @param ctrlKey {boolean}
         * @param altKey {boolean}
         * @param shiftKey {boolean}
         * @param touchDown {boolean}
         */
        function TouchEvent(type, bubbles, cancelable, touchPointID, stageX, stageY, ctrlKey, altKey, shiftKey, touchDown) {
            if (bubbles === void 0) { bubbles = true; }
            if (cancelable === void 0) { cancelable = true; }
            if (touchPointID === void 0) { touchPointID = 0; }
            if (stageX === void 0) { stageX = 0; }
            if (stageY === void 0) { stageY = 0; }
            if (ctrlKey === void 0) { ctrlKey = false; }
            if (altKey === void 0) { altKey = false; }
            if (shiftKey === void 0) { shiftKey = false; }
            if (touchDown === void 0) { touchDown = false; }
            _super.call(this, type, bubbles, cancelable);
            this._stageX = 0;
            this._stageY = 0;
            this.touchPointID = touchPointID;
            this._stageX = stageX;
            this._stageY = stageY;
            this.ctrlKey = ctrlKey;
            this.altKey = altKey;
            this.touchDown = touchDown;
        }
        Object.defineProperty(TouchEvent.prototype, "stageX", {
            /**
             * 事件发生点在全局舞台坐标中的水平坐标。
             * @member {number} egret.TouchEvent#stageX
             */
            get: function () {
                return this._stageX;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TouchEvent.prototype, "stageY", {
            /**
             * 事件发生点在全局舞台坐标中的垂直坐标。
             * @member {number} egret.TouchEvent#stageY
             */
            get: function () {
                return this._stageY;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TouchEvent.prototype, "localX", {
            /**
             * 事件发生点相对于currentTarget的水平坐标。
             * @member {number} egret.TouchEvent#localX
             */
            get: function () {
                var dp = this._currentTarget;
                var point = dp.globalToLocal(this._stageX, this._stageY, egret.Point.identity);
                return point.x;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TouchEvent.prototype, "localY", {
            /**
             * 事件发生点相对于currentTarget的垂直坐标。
             * @member {number} egret.TouchEvent#localY
             */
            get: function () {
                var dp = this._currentTarget;
                var point = dp.globalToLocal(this._stageX, this._stageY, egret.Point.identity);
                return point.y;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 使用指定的EventDispatcher对象来抛出Event事件对象。抛出的对象将会缓存在对象池上，供下次循环复用。
         * @method egret.TouchEvent.dispatchTouchEvent
         * @param target {egret.IEventDispatcher}
         * @param type {string}
         * @param touchPointID {number}
         * @param stageX {number}
         * @param stageY {number}
         * @param ctrlKey {boolean}
         * @param altKey {boolean}
         * @param shiftKey {boolean}
         * @param touchDown {boolean}
         */
        TouchEvent.dispatchTouchEvent = function (target, type, touchPointID, stageX, stageY, ctrlKey, altKey, shiftKey, touchDown) {
            if (touchPointID === void 0) { touchPointID = 0; }
            if (stageX === void 0) { stageX = 0; }
            if (stageY === void 0) { stageY = 0; }
            if (ctrlKey === void 0) { ctrlKey = false; }
            if (altKey === void 0) { altKey = false; }
            if (shiftKey === void 0) { shiftKey = false; }
            if (touchDown === void 0) { touchDown = false; }
            var eventClass = TouchEvent;
            var props = egret.Event._getPropertyData(eventClass);
            props.touchPointID = touchPointID;
            props._stageX = stageX;
            props._stageY = stageY;
            props.ctrlKey = ctrlKey;
            props.altKey = altKey;
            props.shiftKey = shiftKey;
            props.touchDown = touchDown;
            egret.Event._dispatchByTarget(eventClass, target, type, props, true, true);
        };
        /**
         * 轻触
         * @constant {string} egret.TouchEvent.TOUCH_TAP
         */
        TouchEvent.TOUCH_TAP = "touchTap";
        /**
         * 移动
         * @constant {string} egret.TouchEvent.TOUCH_MOVE
         */
        TouchEvent.TOUCH_MOVE = "touchMove";
        /**
         * 开始触摸
         * @constant {string} egret.TouchEvent.TOUCH_BEGIN
         */
        TouchEvent.TOUCH_BEGIN = "touchBegin";
        /**
         * 在同一对象上结束触摸
         * @constant {string} egret.TouchEvent.TOUCH_END
         */
        TouchEvent.TOUCH_END = "touchEnd";
        /**
         * 在对象外部结束触摸
         * @constant {string} egret.TouchEvent.TOUCH_RELEASE_OUTSIDE
         */
        TouchEvent.TOUCH_RELEASE_OUTSIDE = "touchReleaseOutside";
        /**
         * @deprecated
         */
        TouchEvent.TOUCH_ROLL_OUT = "touchRollOut";
        /**
         * @deprecated
         */
        TouchEvent.TOUCH_ROLL_OVER = "touchRollOver";
        /**
         * @deprecated
         */
        TouchEvent.TOUCH_OUT = "touchOut";
        /**
         * @deprecated
         */
        TouchEvent.TOUCH_OVER = "touchOver";
        return TouchEvent;
    })(egret.Event);
    egret.TouchEvent = TouchEvent;
    TouchEvent.prototype.__class__ = "egret.TouchEvent";
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/** @namespace egret */
var egret;
(function (egret) {
    /**
     * @class egret.TimerEvent
     * @classdesc
     * 每当 Timer 对象达到由 Timer.delay 属性指定的间隔时，Timer 对象即会调度 TimerEvent 对象。
     * @extends egret.Event
     */
    var TimerEvent = (function (_super) {
        __extends(TimerEvent, _super);
        /**
         *
         * @constructor egret.TimerEvent
         * @param type {string} 事件的类型。事件侦听器可以通过继承的 type 属性访问此信息。
         * @param bubbles {boolean} 确定 Event 对象是否冒泡。事件侦听器可以通过继承的 bubbles 属性访问此信息。
         * @param cancelable {boolean} 确定是否可以取消 Event 对象。事件侦听器可以通过继承的 cancelable 属性访问此信息。
         */
        function TimerEvent(type, bubbles, cancelable) {
            if (bubbles === void 0) { bubbles = false; }
            if (cancelable === void 0) { cancelable = false; }
            _super.call(this, type, bubbles, cancelable);
        }
        /**
         * 使用指定的EventDispatcher对象来抛出Event事件对象。抛出的对象将会缓存在对象池上，供下次循环复用。
         * @method egret.TimerEvent.dispatchTimerEvent
         * @param target {egret.IEventDispatcher}
         * @param type {string}
         */
        TimerEvent.dispatchTimerEvent = function (target, type) {
            var eventClass = TimerEvent;
            egret.Event._dispatchByTarget(eventClass, target, type);
        };
        /**
         * 每当 Timer 对象达到根据 Timer.delay 属性指定的间隔时调度。
         * @constant {string} egret.TimerEvent.TIMER
         */
        TimerEvent.TIMER = "timer";
        /**
         * 每当它完成 Timer.repeatCount 设置的请求数后调度。
         * @constant {string} egret.TimerEvent.TIMER_COMPLETE
         */
        TimerEvent.TIMER_COMPLETE = "timerComplete";
        return TimerEvent;
    })(egret.Event);
    egret.TimerEvent = TimerEvent;
    TimerEvent.prototype.__class__ = "egret.TimerEvent";
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var egret;
(function (egret) {
    /**
     * @class egret.EventPhase
     * @classdesc
     * EventPhase 类可为 Event 类的 eventPhase 属性提供值。
     */
    var EventPhase = (function () {
        function EventPhase() {
        }
        /**
         * 捕获阶段，是事件流的第一个阶段。
         * @constant {number} egret.EventPhase.CAPTURING_PHASE
         */
        EventPhase.CAPTURING_PHASE = 1;
        /**
         * 目标阶段，是事件流的第二个阶段。
         * @constant {number} egret.EventPhase.AT_TARGET
         */
        EventPhase.AT_TARGET = 2;
        /**
         * 冒泡阶段，是事件流的第三个阶段。
         * @constant {number} egret.EventPhase.BUBBLING_PHASE
         */
        EventPhase.BUBBLING_PHASE = 3;
        return EventPhase;
    })();
    egret.EventPhase = EventPhase;
    EventPhase.prototype.__class__ = "egret.EventPhase";
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var egret;
(function (egret) {
    /**
     *
     * @class egret.EventDispatcher
     * @classdesc
     * EventDispatcher是egret的事件派发器类，负责进行事件的发送和侦听。
     *
     * 事件目标是事件如何通过显示列表层次结构这一问题的焦点。当发生鼠标单击、触摸或按键等事件时，
     * 引擎会将事件对象调度到从显示列表根开始的事件流中。然后该事件对象在显示列表中前进，直到到达事件目标，
     * 然后从这一点开始其在显示列表中的回程。在概念上，到事件目标的此往返行程被划分为三个阶段：
     * 捕获阶段包括从根到事件目标节点之前的最后一个节点的行程，目标阶段仅包括事件目标节点，冒泡阶段包括回程上遇到的任何后续节点到显示列表的根。
     *
     * @extends egret.HashObject
     * @implements egret.IEventDispatcher
     *
     */
    var EventDispatcher = (function (_super) {
        __extends(EventDispatcher, _super);
        /**
         * EventDispatcher 类是可调度事件的所有类的基类。EventDispatcher 类实现 IEventDispatcher 接口
         * ，并且是 DisplayObject 类的基类。EventDispatcher 类允许显示列表上的任何对象都是一个事件目标，
         * 同样允许使用 IEventDispatcher 接口的方法。
         */
        function EventDispatcher(target) {
            if (target === void 0) { target = null; }
            _super.call(this);
            if (target) {
                this._eventTarget = target;
            }
            else {
                this._eventTarget = this;
            }
        }
        /**
         * 添加事件侦听器
         * @method egret.EventDispatcher#addEventListener
         * @param type {string} 事件的类型。
         * @param listener {Function} 处理事件的侦听器函数。此函数必须接受 Event 对象作为其唯一的参数，并且不能返回任何结果，
         * 如下面的示例所示： function(evt:Event):void 函数可以有任何名称。
         * @param thisObject {any} 侦听函数绑定的this对象
         * @param useCapture {boolean} 确定侦听器是运行于捕获阶段还是运行于目标和冒泡阶段。如果将 useCapture 设置为 true，
         * 则侦听器只在捕获阶段处理事件，而不在目标或冒泡阶段处理事件。如果 useCapture 为 false，则侦听器只在目标或冒泡阶段处理事件。
         * 要在所有三个阶段都侦听事件，请调用 addEventListener 两次：一次将 useCapture 设置为 true，一次将 useCapture 设置为 false。
         * @param  priority {number} 事件侦听器的优先级。优先级由一个带符号的 32 位整数指定。数字越大，优先级越高。优先级为 n 的所有侦听器会在
         * 优先级为 n -1 的侦听器之前得到处理。如果两个或更多个侦听器共享相同的优先级，则按照它们的添加顺序进行处理。默认优先级为 0。
         */
        EventDispatcher.prototype.addEventListener = function (type, listener, thisObject, useCapture, priority) {
            if (useCapture === void 0) { useCapture = false; }
            if (priority === void 0) { priority = 0; }
            if (typeof useCapture === "undefined") {
                useCapture = false;
            }
            if (typeof priority === "undefined") {
                priority = 0;
            }
            if (!listener) {
                egret.Logger.fatal("addEventListener侦听函数不能为空");
            }
            var eventMap;
            if (useCapture) {
                if (!this._captureEventsMap)
                    this._captureEventsMap = {};
                eventMap = this._captureEventsMap;
            }
            else {
                if (!this._eventsMap)
                    this._eventsMap = {};
                eventMap = this._eventsMap;
            }
            var list = eventMap[type];
            if (!list) {
                list = eventMap[type] = [];
            }
            this._insertEventBin(list, listener, thisObject, priority);
        };
        /**
         * 在一个事件列表中按优先级插入事件对象
         */
        EventDispatcher.prototype._insertEventBin = function (list, listener, thisObject, priority, display) {
            if (display === void 0) { display = undefined; }
            var insertIndex = -1;
            var length = list.length;
            for (var i = 0; i < length; i++) {
                var bin = list[i];
                if (bin.listener === listener && bin.thisObject === thisObject && bin.display === display) {
                    return false;
                }
                if (insertIndex == -1 && bin.priority < priority) {
                    insertIndex = i;
                }
            }
            var eventBin = { listener: listener, thisObject: thisObject, priority: priority };
            if (display) {
                eventBin.display = display;
            }
            if (insertIndex != -1) {
                list.splice(insertIndex, 0, eventBin);
            }
            else {
                list.push(eventBin);
            }
            return true;
        };
        /**
         * 移除事件侦听器
         * @method egret.EventDispatcher#removeEventListener
         * @param type {string} 事件名
         * @param listener {Function} 侦听函数
         * @param thisObject {any} 侦听函数绑定的this对象
         * @param useCapture {boolean} 是否使用捕获，这个属性只在显示列表中生效。
         */
        EventDispatcher.prototype.removeEventListener = function (type, listener, thisObject, useCapture) {
            if (useCapture === void 0) { useCapture = false; }
            var eventMap = useCapture ? this._captureEventsMap : this._eventsMap;
            if (!eventMap)
                return;
            var list = eventMap[type];
            if (!list) {
                return;
            }
            this._removeEventBin(list, listener, thisObject);
            if (list.length == 0) {
                delete eventMap[type];
            }
        };
        /**
         * 在一个事件列表中按优先级插入事件对象
         */
        EventDispatcher.prototype._removeEventBin = function (list, listener, thisObject, display) {
            if (display === void 0) { display = undefined; }
            var length = list.length;
            for (var i = 0; i < length; i++) {
                var bin = list[i];
                if (bin.listener === listener && bin.thisObject === thisObject && bin.display === display) {
                    list.splice(i, 1);
                    return true;
                }
            }
            return false;
        };
        /**
         * 检测是否存在监听器
         * @method egret.EventDispatcher#hasEventListener
         * @param type {string} 事件类型
         * @returns {boolean}
         * @stable A
         */
        EventDispatcher.prototype.hasEventListener = function (type) {
            return (this._eventsMap && this._eventsMap[type] || this._captureEventsMap && this._captureEventsMap[type]);
        };
        /**
         * 检查是否用此 EventDispatcher 对象或其任何始祖为指定事件类型注册了事件侦听器。将指定类型的事件调度给此
         * EventDispatcher 对象或其任一后代时，如果在事件流的任何阶段触发了事件侦听器，则此方法返回 true。
         * hasEventListener() 与 willTrigger() 方法的区别是：hasEventListener() 只检查它所属的对象，
         * 而 willTrigger() 方法检查整个事件流以查找由 type 参数指定的事件。
         * @method egret.EventDispatcher#willTrigger
         * @param type {string} 事件类型
         * @returns {boolean} 是否注册过监听器，如果注册过返回true，反之返回false
         */
        EventDispatcher.prototype.willTrigger = function (type) {
            return this.hasEventListener(type);
        };
        /**
         * 将事件分派到事件流中。事件目标是对其调用 dispatchEvent() 方法的 EventDispatcher 对象。
         * @method egret.EventDispatcher#dispatchEvent
         * @param event {egret.Event} 调度到事件流中的 Event 对象。如果正在重新分派事件，则会自动创建此事件的一个克隆。 在调度了事件后，其 _eventTarget 属性将无法更改，因此您必须创建此事件的一个新副本以能够重新调度。
         * @returns {boolean} 如果成功调度了事件，则值为 true。值 false 表示失败或对事件调用了 preventDefault()。
         */
        EventDispatcher.prototype.dispatchEvent = function (event) {
            event._reset();
            event._target = this._eventTarget;
            event._currentTarget = this._eventTarget;
            return this._notifyListener(event);
        };
        EventDispatcher.prototype._notifyListener = function (event) {
            var eventMap = event._eventPhase == 1 ? this._captureEventsMap : this._eventsMap;
            if (!eventMap) {
                return true;
            }
            var list = eventMap[event._type];
            if (!list) {
                return true;
            }
            var length = list.length;
            if (length == 0) {
                return true;
            }
            list = list.concat();
            for (var i = 0; i < length; i++) {
                var eventBin = list[i];
                eventBin.listener.call(eventBin.thisObject, event);
                if (event._isPropagationImmediateStopped) {
                    break;
                }
            }
            return !event._isDefaultPrevented;
        };
        /**
         * 派发一个包含了特定参数的事件到所有注册了特定类型侦听器的对象中。 这个方法使用了一个内部的事件对象池因避免重复的分配导致的额外开销。
         * @method egret.EventDispatcher#dispatchEventWith
         * @param type {string} 事件类型
         * @param bubbles {boolean} 是否冒泡，默认false
         * @param data {any}附加数据(可选)
         */
        EventDispatcher.prototype.dispatchEventWith = function (type, bubbles, data) {
            if (bubbles === void 0) { bubbles = false; }
            egret.Event.dispatchEvent(this, type, bubbles, data);
        };
        return EventDispatcher;
    })(egret.HashObject);
    egret.EventDispatcher = EventDispatcher;
    EventDispatcher.prototype.__class__ = "egret.EventDispatcher";
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var egret;
(function (egret) {
    /**
     * @class egret.MainContext
     * @classdesc
     * MainContext是游戏的核心跨平台接口，组合了多个功能Context，并是游戏启动的主入口
     * @extends egret.EventDispatcher
     */
    var MainContext = (function (_super) {
        __extends(MainContext, _super);
        function MainContext() {
            _super.call(this);
            this.reuseEvent = new egret.Event("");
        }
        /**
         * 游戏启动，开启主循环，参考Flash的滑动跑道模型
         * @method egret.MainContext#run
         */
        MainContext.prototype.run = function () {
            egret.Ticker.getInstance().run();
            egret.Ticker.getInstance().register(this.renderLoop, this, Number.NEGATIVE_INFINITY);
            egret.Ticker.getInstance().register(this.broadcastEnterFrame, this, Number.POSITIVE_INFINITY);
            this.touchContext.run();
        };
        /**
         * 滑动跑道模型，渲染部分
         */
        MainContext.prototype.renderLoop = function (frameTime) {
            if (egret.__callLaterFunctionList.length > 0) {
                var functionList = egret.__callLaterFunctionList;
                egret.__callLaterFunctionList = [];
                var thisList = egret.__callLaterThisList;
                egret.__callLaterThisList = [];
                var argsList = egret.__callLaterArgsList;
                egret.__callLaterArgsList = [];
            }
            var stage = this.stage;
            var event = MainContext.cachedEvent;
            event._type = egret.Event.RENDER;
            this.dispatchEvent(event);
            if (egret.Stage._invalidateRenderFlag) {
                this.broadcastRender();
                egret.Stage._invalidateRenderFlag = false;
            }
            if (functionList) {
                this.doCallLaterList(functionList, thisList, argsList);
            }
            if (egret.__callAsyncFunctionList.length > 0) {
                this.doCallAsyncList();
            }
            var context = this.rendererContext;
            context.onRenderStart();
            context.clearScreen();
            stage._updateTransform();
            event._type = egret.Event.FINISH_UPDATE_TRANSFORM;
            this.dispatchEvent(event);
            stage._draw(context);
            event._type = egret.Event.FINISH_RENDER;
            this.dispatchEvent(event);
            context.onRenderFinish();
        };
        /**
         * 广播EnterFrame事件。
         */
        MainContext.prototype.broadcastEnterFrame = function (frameTime) {
            var event = this.reuseEvent;
            event._type = egret.Event.ENTER_FRAME;
            this.dispatchEvent(event);
            var list = egret.DisplayObject._enterFrameCallBackList.concat();
            var length = list.length;
            for (var i = 0; i < length; i++) {
                var eventBin = list[i];
                event._target = eventBin.display;
                event._currentTarget = eventBin.display;
                eventBin.listener.call(eventBin.thisObject, event);
            }
            list = egret.Recycler._callBackList;
            for (i = list.length - 1; i >= 0; i--) {
                list[i]._checkFrame();
            }
        };
        /**
         * 广播Render事件。
         */
        MainContext.prototype.broadcastRender = function () {
            var event = this.reuseEvent;
            event._type = egret.Event.RENDER;
            var list = egret.DisplayObject._renderCallBackList.concat();
            var length = list.length;
            for (var i = 0; i < length; i++) {
                var eventBin = list[i];
                var target = eventBin.display;
                event._target = target;
                event._currentTarget = target;
                eventBin.listener.call(eventBin.thisObject, event);
            }
        };
        /**
         * 执行callLater回调函数列表
         */
        MainContext.prototype.doCallLaterList = function (funcList, thisList, argsList) {
            var length = funcList.length;
            for (var i = 0; i < length; i++) {
                var func = funcList[i];
                if (func != null) {
                    func.apply(thisList[i], argsList[i]);
                }
            }
        };
        /**
         * 执行callAsync回调函数列表
         */
        MainContext.prototype.doCallAsyncList = function () {
            var locCallAsyncFunctionList = egret.__callAsyncFunctionList.concat();
            var locCallAsyncThisList = egret.__callAsyncThisList.concat();
            var locCallAsyncArgsList = egret.__callAsyncArgsList.concat();
            egret.__callAsyncFunctionList.length = 0;
            egret.__callAsyncThisList.length = 0;
            egret.__callAsyncArgsList.length = 0;
            for (var i = 0; i < locCallAsyncFunctionList.length; i++) {
                var func = locCallAsyncFunctionList[i];
                if (func != null) {
                    func.apply(locCallAsyncThisList[i], locCallAsyncArgsList[i]);
                }
            }
        };
        MainContext.DEVICE_PC = "web";
        MainContext.DEVICE_MOBILE = "native";
        MainContext.RUNTIME_HTML5 = "runtime_html5";
        MainContext.RUNTIME_NATIVE = "runtime_native";
        MainContext.cachedEvent = new egret.Event("");
        return MainContext;
    })(egret.EventDispatcher);
    egret.MainContext = MainContext;
    MainContext.prototype.__class__ = "egret.MainContext";
})(egret || (egret = {}));
var testDeviceType = function () {
    if (!this["navigator"]) {
        return true;
    }
    var ua = navigator.userAgent.toLowerCase();
    return (ua.indexOf('mobile') != -1 || ua.indexOf('android') != -1);
};
var testRuntimeType = function () {
    if (this["navigator"]) {
        return true;
    }
    return false;
};
egret.MainContext.instance = new egret.MainContext();
egret.MainContext.deviceType = testDeviceType() ? egret.MainContext.DEVICE_MOBILE : egret.MainContext.DEVICE_PC;
egret.MainContext.runtimeType = testRuntimeType() ? egret.MainContext.RUNTIME_HTML5 : egret.MainContext.RUNTIME_NATIVE;
delete testDeviceType;
delete testRuntimeType;

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var egret;
(function (egret) {
    /**
     * @class egret.Profiler
     * @classdesc
     * Profiler是egret的性能检测分析类
     * 请使用 egret.Profiler.getInstance().run();打开性能分析显示。
     */
    var Profiler = (function () {
        function Profiler() {
            this._lastTime = 0;
            this._logicPerformanceCost = 0;
            this._renderPerformanceCost = 0;
            this._updateTransformPerformanceCost = 0;
            this._preDrawCount = 0;
            this._tick = 0;
            this._maxDeltaTime = 500;
            this._totalDeltaTime = 0;
        }
        /**
         * 返回系统中唯一的Profiler实例。
         * @returns {Profiler}
         */
        Profiler.getInstance = function () {
            if (Profiler.instance == null) {
                Profiler.instance = new Profiler();
            }
            return Profiler.instance;
        };
        /**
         * 启动Profiler
         * @method egret.Profiler#run
         */
        Profiler.prototype.run = function () {
            //todo 加入debug参数
            egret.Ticker.getInstance().register(this.update, this);
            if (this._txt == null) {
                this._txt = new egret.TextField();
                this._txt.size = 28;
                this._txt.multiline = true;
                egret.MainContext.instance.stage.addChild(this._txt);
            }
            var context = egret.MainContext.instance;
            context.addEventListener(egret.Event.ENTER_FRAME, this.onEnterFrame, this);
            context.addEventListener(egret.Event.RENDER, this.onStartRender, this);
            context.addEventListener(egret.Event.FINISH_RENDER, this.onFinishRender, this);
            context.addEventListener(egret.Event.FINISH_UPDATE_TRANSFORM, this.onFinishUpdateTransform, this);
        };
        /**
         * @private
         */
        Profiler.prototype.onEnterFrame = function (event) {
            this._lastTime = egret.getTimer();
        };
        /**
         * @private
         */
        Profiler.prototype.onStartRender = function (event) {
            var now = egret.getTimer();
            this._logicPerformanceCost = now - this._lastTime;
            this._lastTime = now;
        };
        Profiler.prototype.onFinishUpdateTransform = function (event) {
            var now = egret.getTimer();
            this._updateTransformPerformanceCost = now - this._lastTime;
            this._lastTime = now;
        };
        /**
         * @private
         */
        Profiler.prototype.onFinishRender = function (event) {
            var now = egret.getTimer();
            this._renderPerformanceCost = now - this._lastTime;
            this._lastTime = now;
        };
        /**
         * @private
         */
        Profiler.prototype.update = function (frameTime) {
            this._tick++;
            this._totalDeltaTime += frameTime;
            if (this._totalDeltaTime >= this._maxDeltaTime) {
                var drawStr = (this._preDrawCount - 1).toString();
                var timeStr = Math.ceil(this._logicPerformanceCost).toString() + "," + Math.ceil(this._updateTransformPerformanceCost).toString() + "," + Math.ceil(this._renderPerformanceCost).toString() + "," + Math.ceil(egret.MainContext.instance.rendererContext.renderCost).toString();
                var frameStr = Math.floor(this._tick * 1000 / this._totalDeltaTime).toString();
                this._txt.text = "draw:" + drawStr + "\n" + "cost:" + timeStr + "\n" + "FPS:" + frameStr;
                this._totalDeltaTime = 0;
                this._tick = 0;
            }
            this._preDrawCount = 0;
        };
        /**
         * @method egret.Profiler#onDrawImage
         * @private
         */
        Profiler.prototype.onDrawImage = function () {
            this._preDrawCount++;
        };
        return Profiler;
    })();
    egret.Profiler = Profiler;
    Profiler.prototype.__class__ = "egret.Profiler";
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var egret;
(function (egret) {
    /**
     * @class egret.Ticker
     * @classdesc
     * Ticker是egret引擎的心跳控制器，是游戏唯一的时间处理入口。开发者务必不要使用setTimeout / setInterval 等方法，而是统一使用Ticker
     * @extends egret.EventDispatcher
     */
    var Ticker = (function (_super) {
        __extends(Ticker, _super);
        function Ticker() {
            _super.apply(this, arguments);
            this._timeScale = 1;
            this._paused = false;
            this.callBackList = [];
        }
        /**
         * 启动心跳控制器。
         * 这个函数应只在游戏初始化时调用一次
         * @method egret.Ticker#run
         * @stable A
         */
        Ticker.prototype.run = function () {
            egret.__START_TIME = new Date().getTime();
            var context = egret.MainContext.instance.deviceContext;
            context.executeMainLoop(this.update, this);
        };
        Ticker.prototype.update = function (advancedTime) {
            var list = this.callBackList.concat();
            var length = list.length;
            var frameTime = advancedTime * this._timeScale;
            frameTime *= this._timeScale;
            for (var i = 0; i < length; i++) {
                var eventBin = list[i];
                eventBin.listener.call(eventBin.thisObject, frameTime);
            }
        };
        /**
         * 注册帧回调事件，同一函数的重复监听会被忽略。
         * @method egret.Ticker#register
         * @param listener {Function} 帧回调函数,参数返回上一帧和这帧的间隔时间。示例：onEnterFrame(frameTime:number):void
         * @param thisObject {any} 帧回调函数的this对象
         * @param priority {any} 事件优先级，开发者请勿传递 Number.NEGATIVE_INFINITY 和 Number.POSITIVE_INFINITY
         * @stable A-
         */
        Ticker.prototype.register = function (listener, thisObject, priority) {
            if (priority === void 0) { priority = 0; }
            var list = this.callBackList;
            this._insertEventBin(list, listener, thisObject, priority);
        };
        /**
         * 取消侦听enterFrame事件
         * @method egret.Ticker#unregister
         * @param listener {Function} 事件侦听函数
         * @param thisObject {any} 侦听函数的this对象
         * @stable A-
         */
        Ticker.prototype.unregister = function (listener, thisObject) {
            var list = this.callBackList;
            this._removeEventBin(list, listener, thisObject);
        };
        /**
         * 在指定的延迟（以毫秒为单位）后运行指定的函数。
         * @method egret.Ticker#setTimeout
         * @param listener {Function}
         * @param thisObject {any}
         * @param delay {number}
         * @param ...parameter {any}
         * @deprecated
         */
        Ticker.prototype.setTimeout = function (listener, thisObject, delay) {
            var parameters = [];
            for (var _i = 3; _i < arguments.length; _i++) {
                parameters[_i - 3] = arguments[_i];
            }
            egret.Logger.warning("Ticker#setTimeout方法即将废弃,请使用egret.setTimeout");
            egret.setTimeout.apply(null, [listener, thisObject, delay].concat(parameters));
        };
        /**
         * @method egret.Ticker#setTimeScale
         * @param timeScale {number}
         */
        Ticker.prototype.setTimeScale = function (timeScale) {
            this._timeScale = timeScale;
        };
        /**
         * @method egret.Ticker#getTimeScale
         */
        Ticker.prototype.getTimeScale = function () {
            return this._timeScale;
        };
        /**
         * @method egret.Ticker#pause
         */
        Ticker.prototype.pause = function () {
            this._paused = true;
        };
        /**
         * @method egret.Ticker#resume
         */
        Ticker.prototype.resume = function () {
            this._paused = false;
        };
        /**
         * @method egret.Ticker.getInstance
         * @returns {Ticker}
         */
        Ticker.getInstance = function () {
            if (Ticker.instance == null) {
                Ticker.instance = new Ticker();
            }
            return Ticker.instance;
        };
        return Ticker;
    })(egret.EventDispatcher);
    egret.Ticker = Ticker;
    Ticker.prototype.__class__ = "egret.Ticker";
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var egret;
(function (egret) {
    /**
     * @class egret.HorizontalAlign
     * @classdesc 水平对齐方式
     */
    var HorizontalAlign = (function () {
        function HorizontalAlign() {
        }
        /**
         * 左对齐
         * @constant egret.HorizontalAlign.LEFT
         */
        HorizontalAlign.LEFT = "left";
        /**
         * 右对齐
         * @constant egret.HorizontalAlign.RIGHT
         */
        HorizontalAlign.RIGHT = "right";
        /**
         * 水平居中对齐
         * @constant egret.HorizontalAlign.CENTER
         */
        HorizontalAlign.CENTER = "center";
        /**
         * 水平两端对齐
         * 注意：TextFiled不支持此对齐方式。
         * @constant egret.HorizontalAlign.JUSTIFY
         */
        HorizontalAlign.JUSTIFY = "justify";
        /**
         * 相对于容器对子项进行内容对齐。这会将所有子项的大小统一调整为容器的"内容宽度"。
         * 容器的"内容宽度"是最大子项的大小,如果所有子项都小于容器的宽度，则会将所有子项的大小调整为容器的宽度。
         * 注意：TextFiled不支持此对齐方式。
         * @constant egret.HorizontalAlign.CONTENT_JUSTIFY
         */
        HorizontalAlign.CONTENT_JUSTIFY = "contentJustify";
        return HorizontalAlign;
    })();
    egret.HorizontalAlign = HorizontalAlign;
    HorizontalAlign.prototype.__class__ = "egret.HorizontalAlign";
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var egret;
(function (egret) {
    /**
     * @class egret.VerticalAlign
     * @classdesc 垂直对齐方式
     */
    var VerticalAlign = (function () {
        function VerticalAlign() {
        }
        /**
         * 顶对齐
         * @constant egret.VerticalAlign.TOP
         */
        VerticalAlign.TOP = "top";
        /**
         * 底对齐
         * @constant egret.VerticalAlign.BOTTOM
         */
        VerticalAlign.BOTTOM = "bottom";
        /**
         * 垂直居中对齐
         * @constant egret.VerticalAlign.MIDDLE
         */
        VerticalAlign.MIDDLE = "middle";
        /**
         * 垂直两端对齐
         * 注意：TextFiled不支持此对齐方式。
         * @constant egret.VerticalAlign.JUSTIFY
         */
        VerticalAlign.JUSTIFY = "justify";
        /**
         * 相对于容器对子项进行内容对齐。这会将所有子项的大小统一调整为容器的"内容高度"。
         * 容器的"内容高度"是最大子项的大小,如果所有子项都小于容器的高度，则会将所有子项的大小调整为容器的高度。
         * 注意：TextFiled不支持此对齐方式。
         * @constant egret.VerticalAlign.CONTENT_JUSTIFY
         */
        VerticalAlign.CONTENT_JUSTIFY = "contentJustify";
        return VerticalAlign;
    })();
    egret.VerticalAlign = VerticalAlign;
    VerticalAlign.prototype.__class__ = "egret.VerticalAlign";
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var egret;
(function (egret) {
    /**
     * @class egret.Timer
     * @classdesc
     * @extends egret.EventDispatcher
     */
    var Timer = (function (_super) {
        __extends(Timer, _super);
        function Timer(delay, repeatCount) {
            if (repeatCount === void 0) { repeatCount = 0; }
            _super.call(this);
            this._currentCount = 0;
            this.delay = delay;
            this.repeatCount = repeatCount;
        }
        /**
         * @method egret.Timer#currentCount
         * @returns {number}
         */
        Timer.prototype.currentCount = function () {
            return this._currentCount;
        };
        Object.defineProperty(Timer.prototype, "running", {
            /**
             * @member {boolean} egret.Timer#running
             */
            get: function () {
                return this._running;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * @method egret.Timer#reset
         */
        Timer.prototype.reset = function () {
            this.stop();
            this._currentCount = 0;
        };
        /**
         * @method egret.Timer#start
         */
        Timer.prototype.start = function () {
            if (this._running)
                return;
            this.lastTime = egret.getTimer();
            if (this._currentCount != 0) {
                this._currentCount = 0;
            }
            egret.Ticker.getInstance().register(this.onEnterFrame, this);
            this._running = true;
        };
        /**
         * @method egret.Timer#stop
         */
        Timer.prototype.stop = function () {
            if (!this._running)
                return;
            egret.Ticker.getInstance().unregister(this.onEnterFrame, this);
            this._running = false;
        };
        Timer.prototype.onEnterFrame = function (frameTime) {
            var now = egret.getTimer();
            var passTime = now - this.lastTime;
            if (passTime > this.delay) {
                this.lastTime = now;
                this._currentCount++;
                egret.TimerEvent.dispatchTimerEvent(this, egret.TimerEvent.TIMER);
                if (this.repeatCount > 0 && this._currentCount >= this.repeatCount) {
                    this.stop();
                    egret.TimerEvent.dispatchTimerEvent(this, egret.TimerEvent.TIMER_COMPLETE);
                }
            }
        };
        return Timer;
    })(egret.EventDispatcher);
    egret.Timer = Timer;
    Timer.prototype.__class__ = "egret.Timer";
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var egret;
(function (egret) {
    /**
     * 返回一个对象的完全限定名<br/>
     * @method egret.getQualifiedClassName
     * @param value {any} 需要完全限定类名称的对象，可以将任何 TypeScript / JavaScript值传递给此方法，包括所有可用的TypeScript / JavaScript类型、对象实例、原始类型（如number）和类对象
     * @returns {string}
     * @example
     *  egret.getQualifiedClassName(egret.DisplayObject) //返回 "egret.DisplayObject"
     */
    function getQualifiedClassName(value) {
        var prototype = value.prototype ? value.prototype : value.__proto__;
        if (prototype.hasOwnProperty("__class__")) {
            return prototype["__class__"];
        }
        var constructorString = prototype.constructor.toString();
        var index = constructorString.indexOf("(");
        var className = constructorString.substring(9, index);
        prototype["__class__"] = className;
        return className;
    }
    egret.getQualifiedClassName = getQualifiedClassName;
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var egret;
(function (egret) {
    var __getDefinitionByName__cache = {};
    /**
     * 返回 name 参数指定的类的类对象引用。
     * @method egret.getDefinitionByName
     * @param name {string} 类的名称。
     * @returns {any}
     * @example
     * egret.getDefinitionByName("egret.DisplayObject") //返回 DisplayObject类定义
     */
    function getDefinitionByName(name) {
        if (!name)
            return null;
        var definition = __getDefinitionByName__cache[name];
        if (definition) {
            return definition;
        }
        var paths = name.split(".");
        var length = paths.length;
        definition = __global;
        for (var i = 0; i < length; i++) {
            var path = paths[i];
            definition = definition[path];
            if (!definition) {
                return null;
            }
        }
        __getDefinitionByName__cache[name] = definition;
        return definition;
    }
    egret.getDefinitionByName = getDefinitionByName;
})(egret || (egret = {}));
var __global = __global || this;

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var egret;
(function (egret) {
    var __setTimeout__cache = {};
    var __setTimeout__index = 0;
    /**
     * 在指定的延迟（以毫秒为单位）后运行指定的函数。
     * @method egret.setTimeout
     * @param listener {Function} 侦听函数
     * @param thisObject {any} this对象
     * @param delay {number} 延迟时间，以毫秒为单位
     * @param ...args {any} 参数列表
     * @returns {number} 返回索引，可以用于 clearTimeout
     */
    function setTimeout(listener, thisObject, delay) {
        var args = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            args[_i - 3] = arguments[_i];
        }
        var data = { listener: listener, thisObject: thisObject, delay: delay, params: args };
        if (__setTimeout__index == 0) {
            egret.Ticker.getInstance().register(timeoutUpdate, null);
        }
        __setTimeout__index++;
        __setTimeout__cache[__setTimeout__index] = data;
        return __setTimeout__index;
    }
    egret.setTimeout = setTimeout;
    /**
     * 清除指定延迟后运行的函数。
     * @method egret.clearTimeout
     * @param key {number}
     */
    function clearTimeout(key) {
        delete __setTimeout__cache[key];
    }
    egret.clearTimeout = clearTimeout;
    function timeoutUpdate(dt) {
        for (var key in __setTimeout__cache) {
            var data = __setTimeout__cache[key];
            data.delay -= dt;
            if (data.delay <= 0) {
                data.listener.apply(data.thisObject, data.params);
                delete __setTimeout__cache[key];
            }
        }
    }
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var egret;
(function (egret) {
    /**
     * 检查指定的应用程序域之内是否存在一个公共定义。该定义可以是一个类、一个命名空间或一个函数的定义。
    * @method egret.hasDefinition
     * @param name {string} 定义的名称。
    * @returns {boolean}
     * @example
     * egret.hasDefinition("egret.DisplayObject") //返回 true
     */
    function hasDefinition(name) {
        var definition = egret.getDefinitionByName(name);
        return definition ? true : false;
    }
    egret.hasDefinition = hasDefinition;
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var egret;
(function (egret) {
    /**
     * 转换数字为颜色字符串
     * @method egret.toColorString
     * @param value {number}
     * @returns {string}
     */
    function toColorString(value) {
        if (isNaN(value) || value < 0)
            value = 0;
        if (value > 16777215)
            value = 16777215;
        var color = value.toString(16).toUpperCase();
        while (color.length < 6) {
            color = "0" + color;
        }
        return "#" + color;
    }
    egret.toColorString = toColorString;
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var egret;
(function (egret) {
    /**
     * @class egret.Matrix
     * @classdesc
     * 2D矩阵类，包括常见矩阵算法
     * @extends egret.HashObject
     */
    var Matrix = (function (_super) {
        __extends(Matrix, _super);
        /**
         * @method egret.Matrix#constructor
         * @constructor
         * @param a {number} 缩放或旋转图像时影响像素沿 x 轴定位的值。
         * @param b {number} 旋转或倾斜图像时影响像素沿 y 轴定位的值。
         * @param c {number} 旋转或倾斜图像时影响像素沿 x 轴定位的值。
         * @param d {number} 缩放或旋转图像时影响像素沿 y 轴定位的值。
         * @param tx {number} 沿 x 轴平移每个点的距离。
         * @param ty {number} 沿 y 轴平移每个点的距离。
         */
        function Matrix(a, b, c, d, tx, ty) {
            if (a === void 0) { a = 1; }
            if (b === void 0) { b = 0; }
            if (c === void 0) { c = 0; }
            if (d === void 0) { d = 1; }
            if (tx === void 0) { tx = 0; }
            if (ty === void 0) { ty = 0; }
            _super.call(this);
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.tx = tx;
            this.ty = ty;
        }
        /**
         * @member {any} egret.Matrix#
         */
        // public methods:
        /**
         * 前置矩阵
         * @method egret.Matrix#prepend
         * @param a {number}
         * @param b {number}
         * @param c {number}
         * @param d {number}
         * @param tx {number}
         * @param ty {number}
         * @returns {egret.Matrix}
         */
        Matrix.prototype.prepend = function (a, b, c, d, tx, ty) {
            var tx1 = this.tx;
            if (a != 1 || b != 0 || c != 0 || d != 1) {
                var a1 = this.a;
                var c1 = this.c;
                this.a = a1 * a + this.b * c;
                this.b = a1 * b + this.b * d;
                this.c = c1 * a + this.d * c;
                this.d = c1 * b + this.d * d;
            }
            this.tx = tx1 * a + this.ty * c + tx;
            this.ty = tx1 * b + this.ty * d + ty;
            return this;
        };
        /**
         * 后置矩阵
         * @method egret.Matrix#append
         * @param a {number}
         * @param b {number}
         * @param c {number}
         * @param d {number}
         * @param tx {number}
         * @param ty {number}
         * @returns {egret.Matrix}
         */
        Matrix.prototype.append = function (a, b, c, d, tx, ty) {
            var a1 = this.a;
            var b1 = this.b;
            var c1 = this.c;
            var d1 = this.d;
            if (a != 1 || b != 0 || c != 0 || d != 1) {
                this.a = a * a1 + b * c1;
                this.b = a * b1 + b * d1;
                this.c = c * a1 + d * c1;
                this.d = c * b1 + d * d1;
            }
            this.tx = tx * a1 + ty * c1 + this.tx;
            this.ty = tx * b1 + ty * d1 + this.ty;
            return this;
        };
        /**
         * 前置矩阵
         * @method egret.Matrix#prependTransform
         * @param x {number}
         * @param y {number}
         * @param scaleX {number}
         * @param scaleY {number}
         * @param rotation {number}
         * @param skewX {number}
         * @param skewY {number}
         * @param regX {number}
         * @param regY {number}
         * @returns {egret.Matrix}
         */
        Matrix.prototype.prependTransform = function (x, y, scaleX, scaleY, rotation, skewX, skewY, regX, regY) {
            if (rotation % 360) {
                var r = rotation * Matrix.DEG_TO_RAD;
                var cos = Math.cos(r);
                var sin = Math.sin(r);
            }
            else {
                cos = 1;
                sin = 0;
            }
            if (regX || regY) {
                // append the registration offset:
                this.tx -= regX;
                this.ty -= regY;
            }
            if (skewX || skewY) {
                // TODO: can this be combined into a single prepend operation?
                skewX *= Matrix.DEG_TO_RAD;
                skewY *= Matrix.DEG_TO_RAD;
                this.prepend(cos * scaleX, sin * scaleX, -sin * scaleY, cos * scaleY, 0, 0);
                this.prepend(Math.cos(skewY), Math.sin(skewY), -Math.sin(skewX), Math.cos(skewX), x, y);
            }
            else {
                this.prepend(cos * scaleX, sin * scaleX, -sin * scaleY, cos * scaleY, x, y);
            }
            return this;
        };
        /**
         * 后置矩阵
         * @method egret.Matrix#appendTransform
         * @param x {number}
         * @param y {number}
         * @param scaleX {number}
         * @param scaleY {number}
         * @param rotation {number}
         * @param skewX {number}
         * @param skewY {number}
         * @param regX {number}
         * @param regY {number}
         * @returns {egret.Matrix}
         */
        Matrix.prototype.appendTransform = function (x, y, scaleX, scaleY, rotation, skewX, skewY, regX, regY) {
            if (rotation % 360) {
                var r = rotation * Matrix.DEG_TO_RAD;
                var cos = Math.cos(r);
                var sin = Math.sin(r);
            }
            else {
                cos = 1;
                sin = 0;
            }
            if (skewX || skewY) {
                // TODO: can this be combined into a single append?
                skewX *= Matrix.DEG_TO_RAD;
                skewY *= Matrix.DEG_TO_RAD;
                this.append(Math.cos(skewY), Math.sin(skewY), -Math.sin(skewX), Math.cos(skewX), x, y);
                this.append(cos * scaleX, sin * scaleX, -sin * scaleY, cos * scaleY, 0, 0);
            }
            else {
                this.append(cos * scaleX, sin * scaleX, -sin * scaleY, cos * scaleY, x, y);
            }
            if (regX || regY) {
                // prepend the registration offset:
                this.tx -= regX * this.a + regY * this.c;
                this.ty -= regX * this.b + regY * this.d;
            }
            return this;
        };
        /**
         * 对 Matrix 对象应用旋转转换。
         * 矩阵旋转，以角度制为单位
         * @method egret.Matrix#rotate
         * @param angle {number} 角度
         * @returns {egret.Matrix}
         */
        Matrix.prototype.rotate = function (angle) {
            var cos = Math.cos(angle);
            var sin = Math.sin(angle);
            var a1 = this.a;
            var c1 = this.c;
            var tx1 = this.tx;
            this.a = a1 * cos - this.b * sin;
            this.b = a1 * sin + this.b * cos;
            this.c = c1 * cos - this.d * sin;
            this.d = c1 * sin + this.d * cos;
            this.tx = tx1 * cos - this.ty * sin;
            this.ty = tx1 * sin + this.ty * cos;
            return this;
        };
        /**
         * 矩阵斜切，以角度值为单位
         * @method egret.Matrix#skew
         * @param skewX {number}
         * @param skewY {number}
         * @returns {egret.Matrix}
         */
        Matrix.prototype.skew = function (skewX, skewY) {
            skewX = skewX * Matrix.DEG_TO_RAD;
            skewY = skewY * Matrix.DEG_TO_RAD;
            this.append(Math.cos(skewY), Math.sin(skewY), -Math.sin(skewX), Math.cos(skewX), 0, 0);
            return this;
        };
        /**
         * 矩阵缩放
         * @method egret.Matrix#scale
         * @param x {number}
         * @param y {number}
         * @returns {egret.Matrix}
         */
        Matrix.prototype.scale = function (x, y) {
            this.a *= x;
            this.d *= y;
            this.c *= x;
            this.b *= y;
            this.tx *= x;
            this.ty *= y;
            return this;
        };
        /**
         * 沿 x 和 y 轴平移矩阵，由 x 和 y 参数指定。
         * @method egret.Matrix#translate
         * @param x {number} 沿 x 轴向右移动的量（以像素为单位）。
         * @param y {number} 沿 y 轴向下移动的量（以像素为单位）。
         * @returns {egret.Matrix}
         */
        Matrix.prototype.translate = function (x, y) {
            this.tx += x;
            this.ty += y;
            return this;
        };
        /**
         * 为每个矩阵属性设置一个值，该值将导致 null 转换。
         * 通过应用恒等矩阵转换的对象将与原始对象完全相同。
         * 调用 identity() 方法后，生成的矩阵具有以下属性：a=1、b=0、c=0、d=1、tx=0 和 ty=0。
         * @method egret.Matrix#identity
         * @returns {egret.Matrix}
         */
        Matrix.prototype.identity = function () {
            this.a = this.d = 1;
            this.b = this.c = this.tx = this.ty = 0;
            return this;
        };
        /**
         * 矩阵重置为目标矩阵
         * @method egret.Matrix#identityMatrix
         * @returns {egret.Matrix}
         */
        Matrix.prototype.identityMatrix = function (matrix) {
            this.a = matrix.a;
            this.b = matrix.b;
            this.c = matrix.c;
            this.d = matrix.d;
            this.tx = matrix.tx;
            this.ty = matrix.ty;
            return this;
        };
        /**
         * 执行原始矩阵的逆转换。
         * 您可以将一个逆矩阵应用于对象来撤消在应用原始矩阵时执行的转换。
         * @method egret.Matrix#invert
         * @returns {egret.Matrix}
         */
        Matrix.prototype.invert = function () {
            var a1 = this.a;
            var b1 = this.b;
            var c1 = this.c;
            var d1 = this.d;
            var tx1 = this.tx;
            var n = a1 * d1 - b1 * c1;
            this.a = d1 / n;
            this.b = -b1 / n;
            this.c = -c1 / n;
            this.d = a1 / n;
            this.tx = (c1 * this.ty - d1 * tx1) / n;
            this.ty = -(a1 * this.ty - b1 * tx1) / n;
            return this;
        };
        /**
         * 根据一个矩阵，返回某个点在该矩阵上的坐标
         * @method egret.Matrix.transformCoords
         * @param matrix {egret.Matrix}
         * @param x {number}
         * @param y {number}
         * @returns {numberPoint}
         * @stable C 该方法以后可能删除
         */
        Matrix.transformCoords = function (matrix, x, y) {
            var resultPoint = egret.Point.identity;
            resultPoint.x = matrix.a * x + matrix.c * y + matrix.tx;
            resultPoint.y = matrix.d * y + matrix.b * x + matrix.ty;
            //        resultPoint.x = matrix.a * x + matrix.c * y - matrix.tx;
            //        resultPoint.y = matrix.d * y + matrix.b * x - matrix.ty;
            return resultPoint;
        };
        Matrix.prototype.toArray = function (transpose) {
            if (!this.array) {
                this.array = new Float32Array(9);
            }
            if (transpose) {
                this.array[0] = this.a;
                this.array[1] = this.b;
                this.array[2] = 0;
                this.array[3] = this.c;
                this.array[4] = this.d;
                this.array[5] = 0;
                this.array[6] = this.tx;
                this.array[7] = this.ty;
                this.array[8] = 1;
            }
            else {
                this.array[0] = this.a;
                this.array[1] = this.b;
                this.array[2] = this.tx;
                this.array[3] = this.c;
                this.array[4] = this.d;
                this.array[5] = this.ty;
                this.array[6] = 0;
                this.array[7] = 0;
                this.array[8] = 1;
            }
            return this.array;
        };
        /**
         * @member {any} egret.Matrix.
         */
        // static public properties:
        Matrix.identity = new Matrix();
        Matrix.DEG_TO_RAD = Math.PI / 180;
        return Matrix;
    })(egret.HashObject);
    egret.Matrix = Matrix;
    Matrix.prototype.__class__ = "egret.Matrix";
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var egret;
(function (egret) {
    /**
     * @class egret.Point
     * @classdesc
     * Point 对象表示二维坐标系统中的某个位置，其中 x 表示水平轴，y 表示垂直轴。
     * @extends egret.HashObject
     */
    var Point = (function (_super) {
        __extends(Point, _super);
        /**
         * 创建一个 egret.Point 对象
         * @method egret.Point#constructor
         * @param x {number} 该对象的x属性值，默认为0
         * @param y {number} 该对象的y属性值，默认为0
         */
        function Point(x, y) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            _super.call(this);
            this.x = x;
            this.y = y;
        }
        /**
         * 克隆点对象
         * @method egret.Point#clone
         * @returns {egret.Point}
         */
        Point.prototype.clone = function () {
            return new Point(this.x, this.y);
        };
        /**
         * 确定两个点是否相同。如果两个点具有相同的 x 和 y 值，则它们是相同的点。
         * @method egret.Point#equals
         * @param {egret.Point} toCompare 要比较的点。
         * @returns {boolean} 如果该对象与此 Point 对象相同，则为 true 值，如果不相同，则为 false。
         */
        Point.prototype.equals = function (toCompare) {
            return this.x == toCompare.x && this.y == toCompare.y;
        };
        /**
         * 返回 pt1 和 pt2 之间的距离。
         * @method egret.Point#distance
         * @param p1 {egret.Point} 第一个点
         * @param p2 {egret.Point} 第二个点
         * @returns {number} 第一个点和第二个点之间的距离。
         */
        Point.distance = function (p1, p2) {
            return Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));
        };
        Point.identity = new Point(0, 0);
        return Point;
    })(egret.HashObject);
    egret.Point = Point;
    Point.prototype.__class__ = "egret.Point";
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var egret;
(function (egret) {
    /**
     * @class egret.Rectangle
     * @classdesc 矩形类
     * Rectangle 对象是按其位置（由它左上角的点 (x, y) 确定）以及宽度和高度定义的区域。
     * Rectangle 类的 x、y、width 和 height 属性相互独立；更改一个属性的值不会影响其他属性。
     * 但是，right 和 bottom 属性与这四个属性是整体相关的。例如，如果更改 right 属性的值，则 width 属性的值将发生变化；如果更改 bottom 属性，则 height 属性的值将发生变化。
     * @extends egret.HashObject
     */
    var Rectangle = (function (_super) {
        __extends(Rectangle, _super);
        function Rectangle(x, y, width, height) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            if (width === void 0) { width = 0; }
            if (height === void 0) { height = 0; }
            _super.call(this);
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
        }
        Object.defineProperty(Rectangle.prototype, "right", {
            /**
             * x 和 width 属性的和。
             * @member {number} egret.Rectangle#right
             */
            get: function () {
                return this.x + this.width;
            },
            set: function (value) {
                this.width = value - this.x;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "bottom", {
            /**
             * y 和 height 属性的和。
             * @member {number} egret.Rectangle#bottom
             */
            get: function () {
                return this.y + this.height;
            },
            set: function (value) {
                this.height = value - this.y;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 举行类初始化赋值，开发者尽量调用此方法复用Rectangle对象，而不是每次需要的时候都重新创建
         * @method egret.Rectangle#initialize
         * @param x {number} 矩形的x轴
         * @param y {number} 矩形的y轴
         * @param width {number} 矩形的宽度
         * @param height {number} 矩形的高度
         * @returns {egret.Rectangle}
         */
        Rectangle.prototype.initialize = function (x, y, width, height) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            return this;
        };
        /**
         * 确定由此 Rectangle 对象定义的矩形区域内是否包含指定的点。
         * @method egret.Rectangle#contains
         * @param x {number} 检测点的x轴
         * @param y {number} 检测点的y轴
         * @returns {boolean} 如果检测点位于矩形内，返回true，否则，返回false
         */
        Rectangle.prototype.contains = function (x, y) {
            return this.x <= x && this.x + this.width >= x && this.y <= y && this.y + this.height >= y;
        };
        /**
         * 确定在 toIntersect 参数中指定的对象是否与此 Rectangle 对象相交。此方法检查指定的 Rectangle 对象的 x、y、width 和 height 属性，以查看它是否与此 Rectangle 对象相交。
         * @method egret.Rectangle#intersects
         * @param toIntersect {egret.Rectangle} 要与此 Rectangle 对象比较的 Rectangle 对象。
         * @returns {boolean} 如果两个矩形相交，返回true，否则返回false
         */
        Rectangle.prototype.intersects = function (toIntersect) {
            var toIntersect_right = toIntersect.right;
            var toIntersect_bottom = toIntersect.bottom;
            var self_right = this.right;
            var self_bottom = this.bottom;
            if (this.contains(toIntersect.x, toIntersect.y))
                return true;
            else if (this.contains(toIntersect.x, toIntersect_bottom))
                return true;
            else if (this.contains(toIntersect_right, toIntersect.y))
                return true;
            else if (this.contains(toIntersect_right, toIntersect_bottom))
                return true;
            else if (toIntersect.contains(this.x, this.y))
                return true;
            else if (toIntersect.contains(this.x, self_bottom))
                return true;
            else if (toIntersect.contains(self_right, this.y))
                return true;
            else if (toIntersect.contains(self_right, self_bottom))
                return true;
            return false;
        };
        /**
         * 克隆矩形对象
         * @method egret.Rectangle#clone
         * @returns {egret.Rectangle} 返回克隆后的矩形
         */
        Rectangle.prototype.clone = function () {
            return new Rectangle(this.x, this.y, this.width, this.height);
        };
        /**
         * 确定由此 Rectangle 对象定义的矩形区域内是否包含指定的点。
         * 此方法与 Rectangle.contains() 方法类似，只不过它采用 Point 对象作为参数。
         * @method egret.Rectangle#containsPoint
         * @param point {egret.Point} 包含点对象
         * @returns {boolean} 如果包含，返回true，否则返回false
         */
        Rectangle.prototype.containsPoint = function (point) {
            if (this.x < point.x && this.x + this.width > point.x && this.y < point.y && this.y + this.height > point.y) {
                return true;
            }
            return false;
        };
        /**
         * 引擎内部用于函数传递返回值的全局矩形对象，开发者请勿随意修改此对象
         * @member {egret.Rectangle} egret.Rectangle.identity
         */
        Rectangle.identity = new Rectangle(0, 0, 0, 0);
        return Rectangle;
    })(egret.HashObject);
    egret.Rectangle = Rectangle;
    Rectangle.prototype.__class__ = "egret.Rectangle";
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var egret;
(function (egret) {
    /**
     * @class egret.Logger
     * @classdesc
     * Logger是引擎的日志处理模块入口
     * @stable B 目前Logger的接口设计没有问题，但是考虑到跨平台，需要将其改为一个Context，并且允许开发者自由扩展以实现自身游戏的日志分析收集需求
     * todo:GitHub文档，如何利用日志帮助游戏持续改进
     */
    var Logger = (function () {
        function Logger() {
        }
        /**
         * 表示出现了致命错误，开发者必须修复错误
         * @method egret.Logger.fatal
         * @param actionCode {string} 错误信息
         * @param value {Object} 错误描述信息
         */
        Logger.fatal = function (actionCode, value) {
            if (value === void 0) { value = null; }
            egret.Logger.traceToConsole("Fatal", actionCode, value);
            throw new Error(egret.Logger.getTraceCode("Fatal", actionCode, value));
        };
        /**
         * 记录正常的Log信息
         * @method egret.Logger.info
         * @param actionCode {string} 错误信息
         * @param value {Object} 错误描述信息
         */
        Logger.info = function (actionCode, value) {
            if (value === void 0) { value = null; }
            egret.Logger.traceToConsole("Info", actionCode, value);
        };
        /**
         * 记录可能会出现问题的Log信息
         * @method egret.Logger.warning
         * @param actionCode {string} 错误信息
         * @param value {Object} 错误描述信息
         */
        Logger.warning = function (actionCode, value) {
            if (value === void 0) { value = null; }
            egret.Logger.traceToConsole("Warning", actionCode, value);
        };
        /**
         * @private
         * @param type
         * @param actionCode
         * @param value
         */
        Logger.traceToConsole = function (type, actionCode, value) {
            console.log(egret.Logger.getTraceCode(type, actionCode, value));
        };
        /**
         * @private
         * @param type
         * @param actionCode
         * @param value
         * @returns {string}
         */
        Logger.getTraceCode = function (type, actionCode, value) {
            return "[" + type + "]" + actionCode + ":" + (value == null ? "" : value);
        };
        return Logger;
    })();
    egret.Logger = Logger;
    Logger.prototype.__class__ = "egret.Logger";
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var egret;
(function (egret) {
    /**
     * @deprecated
     */
    var SAXParser = (function (_super) {
        __extends(SAXParser, _super);
        function SAXParser() {
            _super.call(this);
            this._parser = null;
            this._xmlDict = null;
            this._isSupportDOMParser = null;
            this._xmlDict = {};
            if (window["DOMParser"]) {
                this._isSupportDOMParser = true;
                this._parser = new DOMParser();
            }
            else {
                this._isSupportDOMParser = false;
            }
        }
        /**
         * @deprecated
         */
        SAXParser.getInstance = function () {
            if (!SAXParser._instance) {
                SAXParser._instance = new SAXParser();
            }
            return SAXParser._instance;
        };
        /**
         * @deprecated
         */
        SAXParser.prototype.parserXML = function (textxml) {
            var i = 0;
            while (textxml.charAt(i) == "\n" || textxml.charAt(i) == "\t" || textxml.charAt(i) == "\r" || textxml.charAt(i) == " ") {
                i++;
            }
            if (i != 0) {
                textxml = textxml.substring(i, textxml.length);
            }
            var xmlDoc;
            if (this._isSupportDOMParser) {
                xmlDoc = this._parser.parseFromString(textxml, "text/xml");
            }
            else {
                xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                xmlDoc.async = "false";
                xmlDoc.loadXML(textxml);
            }
            if (xmlDoc == null) {
                egret.Logger.info("xml not found!");
            }
            return xmlDoc;
        };
        SAXParser._instance = null;
        return SAXParser;
    })(egret.HashObject);
    egret.SAXParser = SAXParser;
    SAXParser.prototype.__class__ = "egret.SAXParser";
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var egret;
(function (egret) {
    /**
     * @class egret.StageDelegate
     * @classdesc
     * StageDelegate负责处理屏幕适配策略
     * @extends egret.HashObject
     */
    var StageDelegate = (function (_super) {
        __extends(StageDelegate, _super);
        /**
         * @method egret.StageDelegate#constructor
         */
        function StageDelegate() {
            _super.call(this);
            this._designWidth = 0;
            this._designHeight = 0;
            this._scaleX = 1;
            this._scaleY = 1;
            this._offSetY = 0;
            this._stageWidth = 0;
            this._stageHeight = 0;
        }
        /**
         * @method egret.StageDelegate.getInstance
         * @returns {StageDelegate}
         */
        StageDelegate.getInstance = function () {
            if (StageDelegate.instance == null) {
                ContainerStrategy.initialize();
                StageDelegate.instance = new StageDelegate();
            }
            return StageDelegate.instance;
        };
        /**
         * @method egret.StageDelegate#setDesignSize
         * @param width {number}
         * @param height {{number}}
         */
        StageDelegate.prototype.setDesignSize = function (width, height) {
            this._designWidth = width;
            this._designHeight = height;
            if (arguments[2]) {
                egret.Logger.warning("该方法目前不应传入 resolutionPolicy 参数，请在 docs/1.0_Final_ReleaseNote中查看如何升级");
                var resolutionPolicy = arguments[2];
                this._setResolutionPolicy(resolutionPolicy);
            }
        };
        /**
         * @method egret.StageDelegate#_setResolutionPolicy
         * @param resolutionPolic {any}
         */
        StageDelegate.prototype._setResolutionPolicy = function (resolutionPolicy) {
            this._resolutionPolicy = resolutionPolicy;
            resolutionPolicy.init(this);
            resolutionPolicy._apply(this, this._designWidth, this._designHeight);
        };
        /**
         * @method egret.StageDelegate#getScaleX
         */
        StageDelegate.prototype.getScaleX = function () {
            return this._scaleX;
        };
        /**
         * @method egret.StageDelegate#getScaleY
         */
        StageDelegate.prototype.getScaleY = function () {
            return this._scaleY;
        };
        /**
         * @method egret.StageDelegate#getOffSetY
         */
        StageDelegate.prototype.getOffSetY = function () {
            return this._offSetY;
        };
        /**
         * @member egret.StageDelegate.canvas_name
         * @deprecated
         */
        StageDelegate.canvas_name = "egretCanvas";
        /**
         * @member egret.StageDelegate.canvas_div_name
         */
        StageDelegate.canvas_div_name = "gameDiv";
        return StageDelegate;
    })(egret.HashObject);
    egret.StageDelegate = StageDelegate;
    StageDelegate.prototype.__class__ = "egret.StageDelegate";
    /**
     * @class egret.ResolutionPolicy
     * @classdesc
     */
    var ResolutionPolicy = (function () {
        function ResolutionPolicy(containerStg, contentStg) {
            this._containerStrategy = containerStg;
            this._contentStrategy = contentStg;
        }
        /**
         * @method egret.ResolutionPolicy#init
         * @param view {egret.StageDelegate}
         */
        ResolutionPolicy.prototype.init = function (view) {
            this._containerStrategy.init(view);
            this._contentStrategy.init(view);
        };
        /**
         * @method egret.ResolutionPolicy#_apply
         * @param view {any}
         * @param designedResolutionWidth {any}
         * @param designedResolutionHeigh {any}
         */
        ResolutionPolicy.prototype._apply = function (view, designedResolutionWidth, designedResolutionHeight) {
            this._containerStrategy._apply(view, designedResolutionWidth, designedResolutionHeight);
            this._contentStrategy._apply(view, designedResolutionWidth, designedResolutionHeight);
        };
        return ResolutionPolicy;
    })();
    egret.ResolutionPolicy = ResolutionPolicy;
    ResolutionPolicy.prototype.__class__ = "egret.ResolutionPolicy";
    /**
     * @class egret.ContainerStrategy
     * @classdesc
     */
    var ContainerStrategy = (function () {
        function ContainerStrategy() {
        }
        /**
         * @method egret.ContainerStrategy.initialize
         */
        ContainerStrategy.initialize = function () {
            ContainerStrategy.EQUAL_TO_FRAME = new EqualToFrame();
        };
        /**
         * @method egret.ContainerStrategy#init
         * @param vie {any}
         */
        ContainerStrategy.prototype.init = function (view) {
        };
        /**
         * @method egret.ContainerStrategy#_apply
         * @param view {any}
         * @param designedWidth {any}
         * @param designedHeigh {any}
         */
        ContainerStrategy.prototype._apply = function (view, designedWidth, designedHeight) {
        };
        ContainerStrategy.prototype._setupContainer = function () {
            var body = document.body, style;
            if (body && (style = body.style)) {
                style.paddingTop = style.paddingTop || "0px";
                style.paddingRight = style.paddingRight || "0px";
                style.paddingBottom = style.paddingBottom || "0px";
                style.paddingLeft = style.paddingLeft || "0px";
                style.borderTop = style.borderTop || "0px";
                style.borderRight = style.borderRight || "0px";
                style.borderBottom = style.borderBottom || "0px";
                style.borderLeft = style.borderLeft || "0px";
                style.marginTop = style.marginTop || "0px";
                style.marginRight = style.marginRight || "0px";
                style.marginBottom = style.marginBottom || "0px";
                style.marginLeft = style.marginLeft || "0px";
            }
        };
        return ContainerStrategy;
    })();
    egret.ContainerStrategy = ContainerStrategy;
    ContainerStrategy.prototype.__class__ = "egret.ContainerStrategy";
    /**
     * @class egret.EqualToFrame
     * @classdesc
     * @extends egret.ContainerStrategy
     */
    var EqualToFrame = (function (_super) {
        __extends(EqualToFrame, _super);
        function EqualToFrame() {
            _super.apply(this, arguments);
        }
        EqualToFrame.prototype._apply = function (view) {
            this._setupContainer();
        };
        return EqualToFrame;
    })(ContainerStrategy);
    egret.EqualToFrame = EqualToFrame;
    EqualToFrame.prototype.__class__ = "egret.EqualToFrame";
    /**
     * @class egret.ContentStrategy
     * @classdesc
     */
    var ContentStrategy = (function () {
        function ContentStrategy() {
        }
        /**
         * @method egret.ContentStrategy#init
         * @param vie {any}
         */
        ContentStrategy.prototype.init = function (view) {
        };
        /**
         * @method egret.ContentStrategy#_apply
         * @param delegate {egret.StageDelegate}
         * @param designedResolutionWidth {number}
         * @param designedResolutionHeight {number}
         */
        ContentStrategy.prototype._apply = function (delegate, designedResolutionWidth, designedResolutionHeight) {
        };
        ContentStrategy.prototype.setEgretSize = function (w, h, styleW, styleH, left, top) {
            if (left === void 0) { left = 0; }
            if (top === void 0) { top = 0; }
            egret.StageDelegate.getInstance()._stageWidth = w;
            egret.StageDelegate.getInstance()._stageHeight = h;
            var container = document.getElementById(StageDelegate.canvas_div_name);
            container.style.width = styleW + "px";
            container.style.height = styleH + "px";
            container.style.top = top + "px";
        };
        /**
         * 显示区域分辨率宽
         * @returns {number}
         */
        ContentStrategy.prototype._getClientWidth = function () {
            return document.documentElement.clientWidth;
        };
        /**
         * 显示区域分辨率高
         * @returns {number}
         */
        ContentStrategy.prototype._getClientHeight = function () {
            return document.documentElement.clientHeight;
        };
        return ContentStrategy;
    })();
    egret.ContentStrategy = ContentStrategy;
    ContentStrategy.prototype.__class__ = "egret.ContentStrategy";
    /**
     * @class egret.FixedHeight
     * @classdesc
     * @extends egret.ContentStrategy
     */
    var FixedHeight = (function (_super) {
        __extends(FixedHeight, _super);
        /**
         * 构造函数
         * @param minWidth 最终游戏内适配的最小stageWidth，默认没有最小宽度
         */
        function FixedHeight(minWidth) {
            if (minWidth === void 0) { minWidth = 0; }
            _super.call(this);
            this.minWidth = minWidth;
        }
        /**
         * @method egret.FixedHeight#_apply
         * @param delegate {any}
         * @param designedResolutionWidth {any}
         * @param designedResolutionHeight {any}
         */
        FixedHeight.prototype._apply = function (delegate, designedResolutionWidth, designedResolutionHeight) {
            var viewPortWidth = this._getClientWidth(); //分辨率宽
            var viewPortHeight = this._getClientHeight(); //分辨率高
            var scale = viewPortHeight / designedResolutionHeight;
            var designW = viewPortWidth / scale;
            var designH = designedResolutionHeight;
            var scale2 = 1;
            if (this.minWidth != 0) {
                scale2 = Math.min(1, designW / this.minWidth);
            }
            this.setEgretSize(designW / scale2, designH, viewPortWidth, viewPortHeight * scale2);
            delegate._scaleX = scale * scale2;
            delegate._scaleY = scale * scale2;
        };
        return FixedHeight;
    })(ContentStrategy);
    egret.FixedHeight = FixedHeight;
    FixedHeight.prototype.__class__ = "egret.FixedHeight";
    /**
     * @class egret.FixedWidth
     * @classdesc
     * @extends egret.ContentStrategy
     */
    var FixedWidth = (function (_super) {
        __extends(FixedWidth, _super);
        /**
         * 构造函数
         * @param minHeight 最终游戏内适配的最小stageHeight，默认没有最小高度
         */
        function FixedWidth(minHeight) {
            if (minHeight === void 0) { minHeight = 0; }
            _super.call(this);
            this.minHeight = minHeight;
        }
        FixedWidth.prototype._apply = function (delegate, designedResolutionWidth, designedResolutionHeight) {
            var viewPortWidth = this._getClientWidth(); //分辨率宽
            var viewPortHeight = this._getClientHeight(); //分辨率高
            var scale = viewPortWidth / designedResolutionWidth;
            var designW = designedResolutionWidth;
            var designH = viewPortHeight / scale;
            var scale2 = 1;
            if (this.minHeight != 0) {
                scale2 = Math.min(1, designH / this.minHeight);
            }
            var offsetX = viewPortWidth * (1 - scale2) / 2;
            this.setEgretSize(designW, designH / scale2, viewPortWidth * scale2, viewPortHeight, offsetX);
            delegate._scaleX = scale * scale2;
            delegate._scaleY = scale * scale2;
        };
        return FixedWidth;
    })(ContentStrategy);
    egret.FixedWidth = FixedWidth;
    FixedWidth.prototype.__class__ = "egret.FixedWidth";
    /**
     * @class egret.FixedSize
     * @classdesc
     * @extends egret.ContentStrategy
     */
    var FixedSize = (function (_super) {
        __extends(FixedSize, _super);
        function FixedSize(width, height) {
            _super.call(this);
            this.width = width;
            this.height = height;
        }
        /**
         * @method egret.FixedSize#_apply
         * @param delegate {egret.StageDelegate}
         * @param designedResolutionWidth {number}
         * @param designedResolutionHeight {number}
         */
        FixedSize.prototype._apply = function (delegate, designedResolutionWidth, designedResolutionHeight) {
            var viewPortWidth = this.width;
            var viewPortHeight = this.height;
            var scale = viewPortWidth / designedResolutionWidth;
            this.setEgretSize(designedResolutionWidth, viewPortHeight / scale, viewPortWidth, viewPortHeight);
            delegate._scaleX = scale;
            delegate._scaleY = scale;
        };
        return FixedSize;
    })(ContentStrategy);
    egret.FixedSize = FixedSize;
    FixedSize.prototype.__class__ = "egret.FixedSize";
    /**
     * @class egret.NoScale
     * @classdesc
     * @extends egret.ContentStrategy
     */
    var NoScale = (function (_super) {
        __extends(NoScale, _super);
        function NoScale() {
            _super.call(this);
        }
        /**
         * @method egret.NoScale#_apply
         * @param delegate {egret.StageDelegate}
         * @param designedResolutionWidth {number}
         * @param designedResolutionHeight {number}
         */
        NoScale.prototype._apply = function (delegate, designedResolutionWidth, designedResolutionHeight) {
            var offsetX = Math.floor((designedResolutionWidth - designedResolutionWidth) / 2);
            this.setEgretSize(designedResolutionWidth, designedResolutionHeight, designedResolutionWidth, designedResolutionHeight, offsetX);
            delegate._scaleX = 1;
            delegate._scaleY = 1;
        };
        return NoScale;
    })(ContentStrategy);
    egret.NoScale = NoScale;
    NoScale.prototype.__class__ = "egret.NoScale";
    var ShowAll = (function (_super) {
        __extends(ShowAll, _super);
        function ShowAll() {
            _super.call(this);
        }
        /**
         * @method egret.NoScale#_apply
         * @param delegate {egret.StageDelegate}
         * @param designedResolutionWidth {number}
         * @param designedResolutionHeight {number}
         */
        ShowAll.prototype._apply = function (delegate, designedResolutionWidth, designedResolutionHeight) {
            var clientWidth = this._getClientWidth(); //分辨率宽
            var clientHeight = this._getClientHeight(); //分辨率宽
            var viewPortWidth = clientWidth;
            var viewPortHeight = clientHeight;
            var scale = (viewPortWidth / designedResolutionWidth < viewPortHeight / designedResolutionHeight) ? viewPortWidth / designedResolutionWidth : viewPortHeight / designedResolutionHeight;
            var designW = designedResolutionWidth;
            var designH = designedResolutionHeight;
            var viewPortWidth = designW * scale;
            var viewPortHeight = designH * scale;
            var scale2 = 1;
            var offsetX = Math.floor((clientWidth - viewPortWidth) / 2);
            delegate._offSetY = Math.floor((clientHeight - viewPortHeight) / 2);
            this.setEgretSize(designW, designH / scale2, viewPortWidth * scale2, viewPortHeight, offsetX, delegate._offSetY);
            delegate._scaleX = scale * scale2;
            delegate._scaleY = scale * scale2;
        };
        return ShowAll;
    })(ContentStrategy);
    egret.ShowAll = ShowAll;
    ShowAll.prototype.__class__ = "egret.ShowAll";
    var FullScreen = (function (_super) {
        __extends(FullScreen, _super);
        function FullScreen() {
            _super.call(this);
        }
        /**
         * @method egret.NoScale#_apply
         * @param delegate {egret.StageDelegate}
         * @param designedResolutionWidth {number}
         * @param designedResolutionHeight {number}
         */
        FullScreen.prototype._apply = function (delegate, designedResolutionWidth, designedResolutionHeight) {
            var viewPortWidth = this._getClientWidth(); //分辨率宽
            var viewPortHeight = this._getClientHeight(); //分辨率高
            var designW = designedResolutionWidth;
            var designH = designedResolutionHeight;
            var scalex = viewPortWidth / designedResolutionWidth;
            var scaley = viewPortHeight / designedResolutionHeight;
            viewPortWidth = designW * scalex;
            viewPortHeight = designH * scaley;
            this.setEgretSize(designW, designH, viewPortWidth, viewPortHeight);
            delegate._scaleX = scalex;
            delegate._scaleY = scaley;
        };
        return FullScreen;
    })(ContentStrategy);
    egret.FullScreen = FullScreen;
    FullScreen.prototype.__class__ = "egret.FullScreen";
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var egret;
(function (egret) {
    /**
     * @class egret.RenderFilter
     * @classdesc
     * @extends egret.HashObject
     */
    var RenderFilter = (function (_super) {
        __extends(RenderFilter, _super);
        function RenderFilter() {
            _super.call(this);
            this._originalData = {};
            this._drawAreaList = [];
        }
        /**
         * @method egret.egret.getInstance
         * @returns {RenderFilter}
         */
        RenderFilter.getInstance = function () {
            if (RenderFilter.instance == null) {
                RenderFilter.instance = new RenderFilter();
            }
            return RenderFilter.instance;
        };
        /**
         * @method egret.egret#addDrawArea
         * @param area {egret.Rectangle}
         */
        RenderFilter.prototype.addDrawArea = function (area) {
            this._drawAreaList.push(area);
        };
        /**
         * @method egret.egret#clearDrawArea
         */
        RenderFilter.prototype.clearDrawArea = function () {
            this._drawAreaList = [];
        };
        /**
         * 先检查有没有不需要绘制的区域，再把需要绘制的区域绘制出来
         * @method egret.egret#drawImage
         * @param renderContext {any}
         * @param data {RenderData}
         * @param sourceX {number}
         * @param sourceY {number}
         * @param sourceWidth {number}
         * @param sourceHeight {number}
         * @param destX {number}
         * @param destY {number}
         * @param destWidth {number}
         * @param destHeight {number}
         */
        RenderFilter.prototype.drawImage = function (renderContext, data, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight, repeat) {
            if (repeat === void 0) { repeat = undefined; }
            destX = destX || 0;
            destY = destY || 0;
            var locTexture = data._texture_to_render;
            if (locTexture == null || sourceHeight == 0 || sourceWidth == 0 || destWidth == 0 || destHeight == 0) {
                return;
            }
            if (this._drawAreaList.length == 0 || !egret.MainContext.instance.rendererContext["_cacheCanvasContext"]) {
                renderContext.drawImage(locTexture, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight, repeat);
                return;
            }
            //计算worldBounds
            var bounds = egret.DisplayObject.getTransformBounds(data._getSize(egret.Rectangle.identity), data._worldTransform);
            data._worldBounds.initialize(bounds.x, bounds.y, bounds.width, bounds.height);
            var originalData = this._originalData;
            originalData.sourceX = sourceX;
            originalData.sourceY = sourceY;
            originalData.sourceWidth = sourceWidth;
            originalData.sourceHeight = sourceHeight;
            originalData.destX = destX;
            originalData.destY = destY;
            originalData.destWidth = destWidth;
            originalData.destHeight = destHeight;
            var locDrawAreaList = this.getDrawAreaList();
            for (var j = 0; j < locDrawAreaList.length; j++) {
                var drawArea = locDrawAreaList[j];
                if (this.ignoreRender(data, drawArea, originalData.destX, originalData.destY)) {
                    continue;
                }
                //在设置过重绘区域时算出不需要绘制的区域
                //                if (this._drawAreaList.length != 0) {
                //                    //不能允许有旋转和斜切的显示对象跨过重绘区域
                //                    if (data._worldTransform.b != 0 || data._worldTransform.c != 0) {
                //                        //之前已经判断过是否出了重绘区域了
                //                        if (data._worldBounds.x + originalData.destX < drawArea.x
                //                            || data._worldBounds.y + originalData.destY < drawArea.y
                //                            || data._worldBounds.x + data._worldBounds.width + originalData.destX > drawArea.x + drawArea.width
                //                            || data._worldBounds.y + data._worldBounds.height + originalData.destY > drawArea.y + drawArea.height) {
                //                            egret.Logger.fatal("请不要让带有旋转和斜切的显示对象跨过重绘区域");
                //                            return;
                //                        }
                //                    }
                //                    else {
                //                        //因为有旋转和斜切时候不允许跨过重绘区域，所以缩放属性可以直接这么取
                //                        var scaleX = data._worldTransform.a;
                //                        var scaleY = data._worldTransform.d;
                //                        var offset;
                //                        if (data._worldBounds.x + originalData.destX < drawArea.x) {
                //                            offset = (drawArea.x - data._worldBounds.x) / scaleX - originalData.destX;
                //                            sourceX += offset / (destWidth / sourceWidth);
                //                            sourceWidth -= offset / (destWidth / sourceWidth);
                //                            destWidth -= offset;
                //                            destX += offset;
                //                        }
                //                        if (data._worldBounds.y + originalData.destY < drawArea.y) {
                //                            offset = (drawArea.y - data._worldBounds.y) / scaleY - originalData.destY;
                //                            sourceY += offset / (destHeight / sourceHeight);
                //                            sourceHeight -= offset / (destHeight / sourceHeight);
                //                            destHeight -= offset;
                //                            destY += offset;
                //                        }
                //                        if (data._worldBounds.x + data._worldBounds.width + originalData.destX > drawArea.x + drawArea.width) {
                //                            offset = (data._worldBounds.x + data._worldBounds.width - drawArea.x - drawArea.width) / scaleX + originalData.destX;
                //                            sourceWidth -= offset / (destWidth / sourceWidth);
                //                            destWidth -= offset;
                //                        }
                //                        if (data._worldBounds.y + data._worldBounds.height + originalData.destY > drawArea.y + drawArea.height) {
                //                            offset = (data._worldBounds.y + data._worldBounds.height - drawArea.y - drawArea.height) / scaleY + originalData.destY;
                //                            sourceHeight -= offset / (destHeight / sourceHeight);
                //                            destHeight -= offset;
                //                        }
                //                    }
                //                }
                renderContext.drawImage(locTexture, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight, repeat);
            }
        };
        RenderFilter.prototype.ignoreRender = function (data, rect, destX, destY) {
            var bounds = data._worldBounds;
            var destX = destX * data._worldTransform.a;
            var destY = destY * data._worldTransform.d;
            if (bounds.x + bounds.width + destX <= rect.x || bounds.x + destX >= rect.x + rect.width || bounds.y + bounds.height + destY <= rect.y || bounds.y + destY >= rect.y + rect.height) {
                return true;
            }
            return false;
        };
        /**
         * @method egret.egret#getDrawAreaList
         * @returns {Rectangle}
         */
        RenderFilter.prototype.getDrawAreaList = function () {
            var locDrawAreaList;
            //默认整个舞台都是重绘区域
            if (this._drawAreaList.length == 0) {
                if (!this._defaultDrawAreaList) {
                    this._defaultDrawAreaList = [new egret.Rectangle(0, 0, egret.MainContext.instance.stage.stageWidth, egret.MainContext.instance.stage.stageHeight)];
                }
                locDrawAreaList = this._defaultDrawAreaList;
            }
            else {
                locDrawAreaList = this._drawAreaList;
            }
            return locDrawAreaList;
        };
        return RenderFilter;
    })(egret.HashObject);
    egret.RenderFilter = RenderFilter;
    RenderFilter.prototype.__class__ = "egret.RenderFilter";
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var egret;
(function (egret) {
    /**
     * @classdesc 注入器
     * @class egret.Injector
     */
    var Injector = (function () {
        function Injector() {
        }
        /**
         * 以类定义为值进行映射注入，当第一次用getInstance()请求它的单例时才会被实例化。
         * @method egret.Injector.mapClass
         * @param whenAskedFor {any} whenAskedFor 传递类定义或类完全限定名作为需要映射的键。
         * @param instantiateClass {any} instantiateClass 传递类作为需要映射的值，它的构造函数必须为空。若不为空，请使用Injector.mapValue()方法直接注入实例。
         * @param named {string} named 可选参数，在同一个类作为键需要映射多条规则时，可以传入此参数区分不同的映射。在调用getInstance()方法时要传入同样的参数。
         */
        Injector.mapClass = function (whenAskedFor, instantiateClass, named) {
            if (named === void 0) { named = ""; }
            var requestName = this.getKey(whenAskedFor) + "#" + named;
            this.mapClassDic[requestName] = instantiateClass;
        };
        /**
         * 获取完全限定类名
         */
        Injector.getKey = function (hostComponentKey) {
            if (typeof (hostComponentKey) == "string")
                return hostComponentKey;
            return egret.getQualifiedClassName(hostComponentKey);
        };
        /**
         * 以实例为值进行映射注入,当用getInstance()请求单例时始终返回注入的这个实例。
         * @method egret.Injector.mapValue
         * @param whenAskedFor {any} 传递类定义或类的完全限定名作为需要映射的键。
         * @param useValue {any} 传递对象实例作为需要映射的值。
         * @param named {string} 可选参数，在同一个类作为键需要映射多条规则时，可以传入此参数区分不同的映射。在调用getInstance()方法时要传入同样的参数。
         */
        Injector.mapValue = function (whenAskedFor, useValue, named) {
            if (named === void 0) { named = ""; }
            var requestName = this.getKey(whenAskedFor) + "#" + named;
            this.mapValueDic[requestName] = useValue;
        };
        /**
         * 检查指定的映射规则是否存在
         * @method egret.Injector.hasMapRule
         * @param whenAskedFor {any} 传递类定义或类的完全限定名作为需要映射的键。
         * @param named {string} 可选参数，在同一个类作为键需要映射多条规则时，可以传入此参数区分不同的映射。
         * @returns {boolean}
         */
        Injector.hasMapRule = function (whenAskedFor, named) {
            if (named === void 0) { named = ""; }
            var requestName = this.getKey(whenAskedFor) + "#" + named;
            if (this.mapValueDic[requestName] || this.mapClassDic[requestName]) {
                return true;
            }
            return false;
        };
        /**
         * 获取指定类映射的单例，注意:这个方法总是返回全局唯一的实例，不会重复创建。
         * @method egret.Injector.getInstance
         * @param clazz {any} 类定义或类的完全限定名
         * @param named {string} 可选参数，若在调用mapClass()映射时设置了这个值，则要传入同样的字符串才能获取对应的单例
         * @returns {any}
         */
        Injector.getInstance = function (clazz, named) {
            if (named === void 0) { named = ""; }
            var requestName = this.getKey(clazz) + "#" + named;
            if (this.mapValueDic[requestName])
                return this.mapValueDic[requestName];
            var returnClass = (this.mapClassDic[requestName]);
            if (returnClass) {
                var instance = new returnClass();
                this.mapValueDic[requestName] = instance;
                delete this.mapClassDic[requestName];
                return instance;
            }
            throw new Error("调用了未配置的注入规则:" + requestName + "。 请先在项目初始化里配置指定的注入规则，再调用对应单例。");
        };
        /**
         * 储存类的映射规则
         */
        Injector.mapClassDic = {};
        Injector.mapValueDic = {};
        return Injector;
    })();
    egret.Injector = Injector;
    Injector.prototype.__class__ = "egret.Injector";
})(egret || (egret = {}));

/**
 * Copyright (c) Egret-Labs.org. Permission is hereby granted, free of charge,
 * to any person obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish, distribute,
 * sublicense, and/or sell copies of the Software, and to permit persons to whom
 * the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
 * PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
 * FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
var egret;
(function (egret) {
    /**
     * @class egret.BlendMode
     * @classdesc
     * 提供混合模式可视效果的常量值的类。
     */
    var BlendMode = (function () {
        function BlendMode() {
        }
        /**
         * 该显示对象出现在背景前面。显示对象的像素值会覆盖背景的像素值。在显示对象为透明的区域，背景是可见的。
         * @constant {string} egret.BlendMode.NORMAL
         */
        BlendMode.NORMAL = "normal";
        /**
         * 将显示对象的原色值添加到它的背景颜色中，上限值为 0xFF。此设置通常用于使两个对象间的加亮溶解产生动画效果。
         * 例如，如果显示对象的某个像素的 RGB 值为 0xAAA633，背景像素的 RGB 值为 0xDD2200，则显示像素的结果 RGB 值为 0xFFC833（因为 0xAA + 0xDD > 0xFF，0xA6 + 0x22 = 0xC8，且 0x33 + 0x00 = 0x33）。
         * @constant {string} egret.BlendMode.ADD
         */
        BlendMode.ADD = "add";
        return BlendMode;
    })();
    egret.BlendMode = BlendMode;
    BlendMode.prototype.__class__ = "egret.BlendMode";
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written pemission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var egret;
(function (egret) {
    /**
     * @class egret.DisplayObject
     * @extends egret.EventDispatcher
     * @classdesc 类是可放在显示列表中的所有对象的基类。该显示列表管理运行时显示的所有对象。使用 DisplayObjectContainer 类排列显示列表中的显示对象。
     *
     * DisplayObjectContainer 对象可以有子显示对象，而其他显示对象是“叶”节点，只有父级和同级，没有子级。
     *
     * DisplayObject 类支持基本功能（如对象的 x 和 y 位置），也支持更高级的对象属性（如它的转换矩阵），所有显示对象都继承自 DisplayObject 类。
     *
     * DisplayObject 类包含若干广播事件。通常，任何特定事件的目标均为一个特定的 DisplayObject 实例。
     *
     * 若只有一个目标，则会将事件侦听器限制为只能放置到该目标上（在某些情况下，可放置到显示列表中该目标的祖代上），这意味着您可以向任何 DisplayObject 实例添加侦听器来侦听广播事件。
     *
     * 任何继承自DisplayObject的类都必须实现以下方法
     * _render();
     * _measureBounds()
     * 不允许重写以下方法
     * _draw();
     * getBounds();
     *
     */
    var DisplayObject = (function (_super) {
        __extends(DisplayObject, _super);
        function DisplayObject() {
            _super.call(this);
            this.__hack_local_matrix = null;
            this._normalDirty = true;
            //对宽高有影响
            this._sizeDirty = true;
            this._texture_to_render = null;
            this._parent = null;
            /**
             * 表示 DisplayObject 实例相对于父级 DisplayObjectContainer 本地坐标的 x 坐标。
             * 如果该对象位于具有变形的 DisplayObjectContainer 内，则它也位于包含 DisplayObjectContainer 的本地坐标系中。因此，对于逆时针旋转 90 度的 DisplayObjectContainer，该 DisplayObjectContainer 的子级将继承逆时针旋转 90 度的坐标系。
             * @member {number} egret.DisplayObject#x
             */
            this._x = 0;
            /**
             * 表示 DisplayObject 实例相对于父级 DisplayObjectContainer 本地坐标的 y 坐标。
             * 如果该对象位于具有变形的 DisplayObjectContainer 内，则它也位于包含 DisplayObjectContainer 的本地坐标系中。因此，对于逆时针旋转 90 度的 DisplayObjectContainer，该 DisplayObjectContainer 的子级将继承逆时针旋转 90 度的坐标系。
             * @member {number} egret.DisplayObject#y
             */
            this._y = 0;
            /**
             * 表示从注册点开始应用的对象的水平缩放比例（百分比）。
             * 缩放本地坐标系统将更改 x 和 y 属性值，这些属性值是以整像素定义的。
             * 默认值为 1，即不缩放。
             * @member {number} egret.DisplayObject#scaleX
             * @default 1
             */
            this._scaleX = 1;
            /**
             * 表示从对象注册点开始应用的对象的垂直缩放比例（百分比）。
             * 缩放本地坐标系统将更改 x 和 y 属性值，这些属性值是以整像素定义的。
             * 默认值为 1，即不缩放。
             * @member {number} egret.DisplayObject#scaleY
             * @default 1
             */
            this._scaleY = 1;
            /**
             * 表示从对象绝对锚点X。
             * @member {number} egret.DisplayObject#anchorOffsetX
             * @default 0
             */
            this._anchorOffsetX = 0;
            /**
             * 表示从对象绝对锚点Y。
             * @member {number} egret.DisplayObject#anchorOffsetY
             * @default 0
             */
            this._anchorOffsetY = 0;
            /**
             * 表示从对象相对锚点X。
             * @member {number} egret.DisplayObject#anchorX
             * @default 0
             */
            this._anchorX = 0;
            /**
             * 表示从对象相对锚点Y。
             * @member {number} egret.DisplayObject#anchorY
             * @default 0
             */
            this._anchorY = 0;
            /**
             * 显示对象是否可见。
             * 不可见的显示对象已被禁用。例如，如果实例的 visible=false，则无法单击该对象。
             * 默认值为 true 可见
             * @member {boolean} egret.DisplayObject#visible
             */
            this._visible = true;
            /**
             * 表示 DisplayObject 实例距其原始方向的旋转程度，以度为单位。
             * 从 0 到 180 的值表示顺时针方向旋转；从 0 到 -180 的值表示逆时针方向旋转。对于此范围之外的值，可以通过加上或减去 360 获得该范围内的值。例如，my_video.rotation = 450语句与 my_video.rotation = 90 是相同的。
             * @member {number} egret.DisplayObject#rotation
             * @default 0 默认值为 0 不旋转。
             */
            this._rotation = 0;
            /**
             * 表示指定对象的 Alpha 透明度值。
             * 有效值为 0（完全透明）到 1（完全不透明）。alpha 设置为 0 的显示对象是活动的，即使它们不可见。
             * @member {number} egret.DisplayObject#alpha
             *  @default 1 默认值为 1。
             */
            this._alpha = 1;
            /**
             * 表示DisplayObject的x方向斜切
             * @member {number} egret.DisplayObject#skewX
             * @default 0
             */
            this._skewX = 0;
            /**
             * 表示DisplayObject的y方向斜切
             * @member {number} egret.DisplayObject#skewY
             * @default 0
             */
            this._skewY = 0;
            /**
             * 指定此对象是否接收鼠标/触摸事件
             * @member {boolean} egret.DisplayObject#touchEnabled
             * @default false 默认为 false 即不可以接收。
             */
            this._touchEnabled = false;
            /**
             * BlendMode 类中的一个值，用于指定要使用的混合模式。
             * 内部绘制位图的方法有两种。 如果启用了混合模式或外部剪辑遮罩，则将通过向矢量渲染器添加有位图填充的正方形来绘制位图。 如果尝试将此属性设置为无效值，则运行时会将此值设置为 BlendMode.NORMAL。
             * @member {BlendMode} egret.DisplayObject#blendMode
             */
            this.blendMode = null;
            /**
             * 显示对象的滚动矩形范围。显示对象被裁切为矩形定义的大小，当您更改 scrollRect 对象的 x 和 y 属性时，它会在矩形内滚动。
             *  @member {egret.Rectangle} egret.DisplayObject#scrollRect
             */
            this._scrollRect = null;
            this._hasWidthSet = false;
            this._hasHeightSet = false;
            /**
             * 调用显示对象被指定的 mask 对象遮罩。
             * 要确保当舞台缩放时蒙版仍然有效，mask 显示对象必须处于显示列表的活动部分。但不绘制 mask 对象本身。
             * 将 mask 设置为 null 可删除蒙版。
             */
            this.mask = null;
            this._worldBounds = null;
            this.worldAlpha = 1;
            this._rectW = 0;
            this._rectH = 0;
            this._stage = null;
            this._cacheAsBitmap = false;
            this._cacheDirty = false;
            /**
             * beta功能，请勿调用此方法
             */
            this._colorTransform = null;
            this._worldTransform = new egret.Matrix();
            this._worldBounds = new egret.Rectangle(0, 0, 0, 0);
            this._cacheBounds = new egret.Rectangle(0, 0, 0, 0);
        }
        DisplayObject.prototype._setDirty = function () {
            this._normalDirty = true;
        };
        DisplayObject.prototype.getDirty = function () {
            return this._normalDirty || this._sizeDirty;
        };
        DisplayObject.prototype._setParentSizeDirty = function () {
            var parent = this._parent;
            if (parent && (!(parent._hasWidthSet || parent._hasHeightSet))) {
                parent._setSizeDirty();
            }
        };
        DisplayObject.prototype._setSizeDirty = function () {
            if (this._sizeDirty) {
                return;
            }
            this._sizeDirty = true;
            this._setDirty();
            this._setParentSizeDirty();
        };
        DisplayObject.prototype._clearDirty = function () {
            //todo 这个除了文本的，其他都没有clear过
            this._normalDirty = false;
        };
        DisplayObject.prototype._clearSizeDirty = function () {
            //todo 最好在enterFrame都重新算一遍
            this._sizeDirty = false;
        };
        Object.defineProperty(DisplayObject.prototype, "parent", {
            /**
             * 表示包含此显示对象的 DisplayObjectContainer 对象。【只读】
             * 使用 parent 属性可以指定高于显示列表层次结构中当前显示对象的显示对象的相对路径。
             * @member {egret.DisplayObjectContainer} egret.DisplayObject#parent
             */
            get: function () {
                return this._parent;
            },
            enumerable: true,
            configurable: true
        });
        DisplayObject.prototype._parentChanged = function (parent) {
            this._parent = parent;
        };
        Object.defineProperty(DisplayObject.prototype, "x", {
            get: function () {
                return this._x;
            },
            set: function (value) {
                this._setX(value);
            },
            enumerable: true,
            configurable: true
        });
        DisplayObject.prototype._setX = function (value) {
            if (egret.NumberUtils.isNumber(value) && this._x != value) {
                this._x = value;
                this._setDirty();
                this._setParentSizeDirty();
            }
        };
        Object.defineProperty(DisplayObject.prototype, "y", {
            get: function () {
                return this._y;
            },
            set: function (value) {
                this._setY(value);
            },
            enumerable: true,
            configurable: true
        });
        DisplayObject.prototype._setY = function (value) {
            if (egret.NumberUtils.isNumber(value) && this._y != value) {
                this._y = value;
                this._setDirty();
                this._setParentSizeDirty();
            }
        };
        Object.defineProperty(DisplayObject.prototype, "scaleX", {
            get: function () {
                return this._scaleX;
            },
            set: function (value) {
                if (egret.NumberUtils.isNumber(value) && this._scaleX != value) {
                    this._scaleX = value;
                    this._setDirty();
                    this._setParentSizeDirty();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DisplayObject.prototype, "scaleY", {
            get: function () {
                return this._scaleY;
            },
            set: function (value) {
                if (egret.NumberUtils.isNumber(value) && this._scaleY != value) {
                    this._scaleY = value;
                    this._setDirty();
                    this._setParentSizeDirty();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DisplayObject.prototype, "anchorOffsetX", {
            get: function () {
                return this._anchorOffsetX;
            },
            set: function (value) {
                if (egret.NumberUtils.isNumber(value) && this._anchorOffsetX != value) {
                    this._anchorOffsetX = value;
                    this._setDirty();
                    this._setParentSizeDirty();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DisplayObject.prototype, "anchorOffsetY", {
            get: function () {
                return this._anchorOffsetY;
            },
            set: function (value) {
                if (egret.NumberUtils.isNumber(value) && this._anchorOffsetY != value) {
                    this._anchorOffsetY = value;
                    this._setDirty();
                    this._setParentSizeDirty();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DisplayObject.prototype, "anchorX", {
            get: function () {
                return this._anchorX;
            },
            set: function (value) {
                this._setAnchorX(value);
            },
            enumerable: true,
            configurable: true
        });
        DisplayObject.prototype._setAnchorX = function (value) {
            if (egret.NumberUtils.isNumber(value) && this._anchorX != value) {
                this._anchorX = value;
                this._setDirty();
                this._setParentSizeDirty();
            }
        };
        Object.defineProperty(DisplayObject.prototype, "anchorY", {
            get: function () {
                return this._anchorY;
            },
            set: function (value) {
                this._setAnchorY(value);
            },
            enumerable: true,
            configurable: true
        });
        DisplayObject.prototype._setAnchorY = function (value) {
            if (egret.NumberUtils.isNumber(value) && this._anchorY != value) {
                this._anchorY = value;
                this._setDirty();
                this._setParentSizeDirty();
            }
        };
        Object.defineProperty(DisplayObject.prototype, "visible", {
            get: function () {
                return this._visible;
            },
            set: function (value) {
                this._setVisible(value);
            },
            enumerable: true,
            configurable: true
        });
        DisplayObject.prototype._setVisible = function (value) {
            if (this._visible != value) {
                this._visible = value;
                this._setSizeDirty();
            }
        };
        Object.defineProperty(DisplayObject.prototype, "rotation", {
            get: function () {
                return this._rotation;
            },
            set: function (value) {
                if (egret.NumberUtils.isNumber(value) && this._rotation != value) {
                    this._rotation = value;
                    this._setSizeDirty();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DisplayObject.prototype, "alpha", {
            get: function () {
                return this._alpha;
            },
            set: function (value) {
                if (egret.NumberUtils.isNumber(value) && this._alpha != value) {
                    this._alpha = value;
                    this._setDirty();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DisplayObject.prototype, "skewX", {
            get: function () {
                return this._skewX;
            },
            set: function (value) {
                if (egret.NumberUtils.isNumber(value) && this._skewX != value) {
                    this._skewX = value;
                    this._setSizeDirty();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DisplayObject.prototype, "skewY", {
            get: function () {
                return this._skewY;
            },
            set: function (value) {
                if (egret.NumberUtils.isNumber(value) && this._skewY != value) {
                    this._skewY = value;
                    this._setSizeDirty();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DisplayObject.prototype, "touchEnabled", {
            get: function () {
                return this._touchEnabled;
            },
            set: function (value) {
                this._setTouchEnabled(value);
            },
            enumerable: true,
            configurable: true
        });
        DisplayObject.prototype._setTouchEnabled = function (value) {
            this._touchEnabled = value;
        };
        Object.defineProperty(DisplayObject.prototype, "scrollRect", {
            get: function () {
                return this._scrollRect;
            },
            set: function (value) {
                this._setScrollRect(value);
            },
            enumerable: true,
            configurable: true
        });
        DisplayObject.prototype._setScrollRect = function (value) {
            this._scrollRect = value;
            this._setSizeDirty();
        };
        Object.defineProperty(DisplayObject.prototype, "measuredWidth", {
            /**
             * 测量宽度
             * @returns {number}
             */
            get: function () {
                return this._measureBounds().width;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DisplayObject.prototype, "measuredHeight", {
            /**
             * 测量高度
             * @returns {number}
             */
            get: function () {
                return this._measureBounds().height;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DisplayObject.prototype, "explicitWidth", {
            get: function () {
                return this._explicitWidth;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DisplayObject.prototype, "explicitHeight", {
            get: function () {
                return this._explicitHeight;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DisplayObject.prototype, "width", {
            /**
             * 表示显示对象的宽度，以像素为单位。
             * 宽度是根据显示对象内容的范围来计算的。优先顺序为 显式设置宽度 > 测量宽度。
             * @member {number} egret.DisplayObject#width
             * @returns {number}
             */
            get: function () {
                return this._getSize(egret.Rectangle.identity).width;
            },
            /**
             * 显式设置宽度
             * @param value
             */
            set: function (value) {
                this._setWidth(value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DisplayObject.prototype, "height", {
            /**
             * 表示显示对象的高度，以像素为单位。
             * 高度是根据显示对象内容的范围来计算的。优先顺序为 显式设置高度 > 测量高度。
             * @member {number} egret.DisplayObject#height
             * @returns {number}
             */
            get: function () {
                return this._getSize(egret.Rectangle.identity).height;
            },
            /**
             * 显式设置高度
             * @param value
             */
            set: function (value) {
                this._setHeight(value);
            },
            enumerable: true,
            configurable: true
        });
        /**
         * @inheritDoc
         */
        DisplayObject.prototype._setWidth = function (value) {
            this._setSizeDirty();
            this._setCacheDirty();
            this._explicitWidth = value;
            this._hasWidthSet = egret.NumberUtils.isNumber(value);
        };
        /**
         * @inheritDoc
         */
        DisplayObject.prototype._setHeight = function (value) {
            this._setSizeDirty();
            this._setCacheDirty();
            this._explicitHeight = value;
            this._hasHeightSet = egret.NumberUtils.isNumber(value);
        };
        /**
         * @private
         * @param renderContext
         */
        DisplayObject.prototype._draw = function (renderContext) {
            if (!this._visible) {
                this.destroyCacheBounds();
                return;
            }
            var hasDrawCache = this.drawCacheTexture(renderContext);
            if (hasDrawCache) {
                this.destroyCacheBounds();
                return;
            }
            var o = this;
            if (o._colorTransform) {
                renderContext.setGlobalColorTransform(o._colorTransform.matrix);
            }
            renderContext.setAlpha(o.worldAlpha, o.blendMode);
            renderContext.setTransform(o._worldTransform);
            var mask = o.mask || o._scrollRect;
            if (mask) {
                renderContext.pushMask(mask);
            }
            this._render(renderContext);
            if (mask) {
                renderContext.popMask();
            }
            if (o._colorTransform) {
                renderContext.setGlobalColorTransform(null);
            }
            this.destroyCacheBounds();
        };
        DisplayObject.prototype.drawCacheTexture = function (renderContext) {
            var display = this;
            if (display._cacheAsBitmap) {
                if (this._cacheDirty || this.width != this.renderTexture._sourceWidth || this.height != this.renderTexture._sourceHeight) {
                    this._makeBitmapCache();
                    this._cacheDirty = false;
                }
                var renderTexture = display._texture_to_render;
                var offsetX = renderTexture._offsetX;
                var offsetY = renderTexture._offsetY;
                var width = renderTexture._textureWidth;
                var height = renderTexture._textureHeight;
                display._updateTransform();
                renderContext.setAlpha(display.worldAlpha, display.blendMode);
                renderContext.setTransform(display._worldTransform);
                var scale_factor = egret.MainContext.instance.rendererContext.texture_scale_factor;
                var renderFilter = egret.RenderFilter.getInstance();
                renderFilter.drawImage(renderContext, display, 0, 0, width * scale_factor, height * scale_factor, offsetX, offsetY, width, height);
                return true;
            }
            else {
                return false;
            }
        };
        /**
         * @private
         * @param renderContext
         */
        DisplayObject.prototype._updateTransform = function () {
            this._calculateWorldTransform();
        };
        /**
         * 计算全局数据
         * @private
         */
        DisplayObject.prototype._calculateWorldTransform = function () {
            var o = this;
            var worldTransform = o._worldTransform;
            var parent = o._parent;
            worldTransform.identityMatrix(parent._worldTransform);
            this._getMatrix(worldTransform);
            var scrollRect = this._scrollRect;
            if (scrollRect) {
                worldTransform.append(1, 0, 0, 1, -scrollRect.x, -scrollRect.y);
            }
            //            if (this._texture_to_render){
            //                var bounds:egret.Rectangle = DisplayObject.getTransformBounds(o._getSize(Rectangle.identity), o._worldTransform);
            //                o._worldBounds.initialize(bounds.x, bounds.y, bounds.width, bounds.height);
            //            }
            o.worldAlpha = parent.worldAlpha * o._alpha;
        };
        /**
         * @private
         * @param renderContext
         */
        DisplayObject.prototype._render = function (renderContext) {
        };
        /**
         * 获取显示对象的测量边界
         * @method egret.DisplayObject#getBounds
         * @param resultRect {Rectangle} 可选参数，传入用于保存结果的Rectangle对象，避免重复创建对象。
         * @param calculateAnchor {boolean} 可选参数，是否会计算锚点。
         * @returns {Rectangle}
         */
        DisplayObject.prototype.getBounds = function (resultRect, calculateAnchor) {
            if (calculateAnchor === void 0) { calculateAnchor = true; }
            //            if (this._cacheBounds.x == 0 && this._cacheBounds.y == 0 && this._cacheBounds.width == 0 && this._cacheBounds.height == 0) {
            var rect = this._measureBounds();
            var w = this._hasWidthSet ? this._explicitWidth : rect.width;
            var h = this._hasHeightSet ? this._explicitHeight : rect.height;
            //记录测量宽高
            this._rectW = rect.width;
            this._rectH = rect.height;
            this._clearSizeDirty();
            var x = rect.x;
            var y = rect.y;
            var anchorX = 0, anchorY = 0;
            if (calculateAnchor) {
                if (this._anchorX != 0 || this._anchorY != 0) {
                    anchorX = w * this._anchorX;
                    anchorY = h * this._anchorY;
                }
                else {
                    anchorX = this._anchorOffsetX;
                    anchorY = this._anchorOffsetY;
                }
            }
            this._cacheBounds.initialize(x - anchorX, y - anchorY, w, h);
            //            }
            var result = this._cacheBounds;
            if (!resultRect) {
                resultRect = new egret.Rectangle();
            }
            return resultRect.initialize(result.x, result.y, result.width, result.height);
        };
        DisplayObject.prototype.destroyCacheBounds = function () {
            this._cacheBounds.x = 0;
            this._cacheBounds.y = 0;
            this._cacheBounds.width = 0;
            this._cacheBounds.height = 0;
        };
        DisplayObject.prototype._getConcatenatedMatrix = function () {
            //todo:采用local_matrix模式下这里的逻辑需要修改
            var matrix = DisplayObject.identityMatrixForGetConcatenated.identity();
            var o = this;
            while (o != null) {
                if (o._anchorX != 0 || o._anchorY != 0) {
                    var bounds = o._getSize(egret.Rectangle.identity);
                    matrix.prependTransform(o._x, o._y, o._scaleX, o._scaleY, o._rotation, o._skewX, o._skewY, bounds.width * o._anchorX, bounds.height * o._anchorY);
                }
                else {
                    matrix.prependTransform(o._x, o._y, o._scaleX, o._scaleY, o._rotation, o._skewX, o._skewY, o._anchorOffsetX, o._anchorOffsetY);
                }
                o = o._parent;
            }
            return matrix;
        };
        /**
         * 将 point 对象从显示对象的（本地）坐标转换为舞台（全局）坐标。
         * @method egret.DisplayObject#localToGlobal
         * @param x {number} 本地x坐标
         * @param y {number} 本地y坐标
         * @param resultPoint {Point} 可选参数，传入用于保存结果的Point对象，避免重复创建对象。
         * @returns {egret.Point} 具有相对于舞台的坐标的 Point 对象。
         */
        DisplayObject.prototype.localToGlobal = function (x, y, resultPoint) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            var mtx = this._getConcatenatedMatrix();
            mtx.append(1, 0, 0, 1, x, y);
            if (!resultPoint) {
                resultPoint = new egret.Point();
            }
            resultPoint.x = mtx.tx;
            resultPoint.y = mtx.ty;
            return resultPoint;
        };
        /**
         * 将指定舞台坐标（全局）转换为显示对象（本地）坐标。
         * @method egret.DisplayObject#globalToLocal
         * @param x {number} 全局x坐标
         * @param y {number} 全局y坐标
         * @param resultPoint {Point} 可选参数，传入用于保存结果的Point对象，避免重复创建对象。
         * @returns {egret.Point} 具有相对于显示对象的坐标的 Point 对象。
         */
        DisplayObject.prototype.globalToLocal = function (x, y, resultPoint) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            var mtx = this._getConcatenatedMatrix();
            mtx.invert();
            mtx.append(1, 0, 0, 1, x, y);
            if (!resultPoint) {
                resultPoint = new egret.Point();
            }
            resultPoint.x = mtx.tx;
            resultPoint.y = mtx.ty;
            return resultPoint;
        };
        /**
         * 检测指定坐标是否在显示对象内
         * @method egret.DisplayObject#hitTest
         * @param x {number} 检测坐标的x轴
         * @param y {number} 检测坐标的y轴
         * @param ignoreTouchEnabled {boolean} 是否忽略TouchEnabled
         * @returns {*}
         */
        DisplayObject.prototype.hitTest = function (x, y, ignoreTouchEnabled) {
            if (ignoreTouchEnabled === void 0) { ignoreTouchEnabled = false; }
            if (!this._visible || (!ignoreTouchEnabled && !this._touchEnabled)) {
                return null;
            }
            var bound = this._getSize(egret.Rectangle.identity);
            if (0 <= x && x < bound.width && 0 <= y && y < bound.height) {
                if (this.mask || this._scrollRect) {
                    if (this._scrollRect && x > this._scrollRect.x && y > this._scrollRect.y && x < this._scrollRect.x + this._scrollRect.width && y < this._scrollRect.y + this._scrollRect.height) {
                        return this;
                    }
                    else if (this.mask && this.mask.x <= x && x < this.mask.x + this.mask.width && this.mask.y <= y && y < this.mask.y + this.mask.height) {
                        return this;
                    }
                    return null;
                }
                return this;
            }
            else {
                return null;
            }
        };
        /**
         * 计算显示对象，以确定它是否与 x 和 y 参数指定的点重叠或相交。x 和 y 参数指定舞台的坐标空间中的点，而不是包含显示对象的显示对象容器中的点（除非显示对象容器是舞台）。
         * 注意，不要在大量物体中使用精确碰撞像素检测，这回带来巨大的性能开销
         * @method egret.DisplayObject#hitTestPoint
         * @param x {number}  要测试的此对象的 x 坐标。
         * @param y {number}  要测试的此对象的 y 坐标。
         * @param shapeFlag {boolean} 是检查对象 (true) 的实际像素，还是检查边框 (false) 的实际像素。
         * @returns {boolean} 如果显示对象与指定的点重叠或相交，则为 true；否则为 false。
         */
        DisplayObject.prototype.hitTestPoint = function (x, y, shapeFlag) {
            var p = this.globalToLocal(x, y);
            if (!shapeFlag) {
                return !!this.hitTest(p.x, p.y, true);
            }
            else {
                if (!this._hitTestPointTexture) {
                    this._hitTestPointTexture = new egret.RenderTexture();
                }
                var testTexture = this._hitTestPointTexture;
                testTexture.drawToTexture(this);
                var pixelData = testTexture.getPixel32(p.x - this._hitTestPointTexture._offsetX, p.y - this._hitTestPointTexture._offsetY);
                if (pixelData[3] != 0) {
                    return true;
                }
                return false;
            }
        };
        DisplayObject.prototype._getMatrix = function (parentMatrix) {
            if (!parentMatrix) {
                parentMatrix = egret.Matrix.identity.identity();
            }
            var anchorX, anchorY;
            var resultPoint = this._getOffsetPoint();
            anchorX = resultPoint.x;
            anchorY = resultPoint.y;
            var matrix = this.__hack_local_matrix;
            if (matrix) {
                parentMatrix.append(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty);
                parentMatrix.append(1, 0, 0, 1, -anchorX, -anchorY);
            }
            else {
                parentMatrix.appendTransform(this._x, this._y, this._scaleX, this._scaleY, this._rotation, this._skewX, this._skewY, anchorX, anchorY);
            }
            return parentMatrix;
        };
        DisplayObject.prototype._getSize = function (resultRect) {
            if (this._hasHeightSet && this._hasWidthSet) {
                return resultRect.initialize(0, 0, this._explicitWidth, this._explicitHeight);
            }
            return this._measureSize(resultRect);
        };
        /**
         * 测量显示对象坐标与大小
         */
        DisplayObject.prototype._measureSize = function (resultRect) {
            if (this._sizeDirty) {
                resultRect = this._measureBounds();
                this._rectW = resultRect.width;
                this._rectH = resultRect.height;
                this._clearSizeDirty();
            }
            else {
                resultRect.width = this._rectW;
                resultRect.height = this._rectH;
            }
            resultRect.x = 0;
            resultRect.y = 0;
            return resultRect;
        };
        /**
         * 测量显示对象坐标，这个方法需要子类重写
         * @returns {egret.Rectangle}
         * @private
         */
        DisplayObject.prototype._measureBounds = function () {
            return egret.Rectangle.identity.initialize(0, 0, 0, 0);
        };
        DisplayObject.prototype._getOffsetPoint = function () {
            var o = this;
            var regX = o._anchorOffsetX;
            var regY = o._anchorOffsetY;
            if (o._anchorX != 0 || o._anchorY != 0) {
                var bounds = o._getSize(egret.Rectangle.identity);
                regX = o._anchorX * bounds.width;
                regY = o._anchorY * bounds.height;
            }
            var result = egret.Point.identity;
            result.x = regX;
            result.y = regY;
            return result;
        };
        DisplayObject.prototype._onAddToStage = function () {
            this._stage = egret.MainContext.instance.stage;
            egret.DisplayObjectContainer.__EVENT__ADD_TO_STAGE_LIST.push(this);
        };
        DisplayObject.prototype._onRemoveFromStage = function () {
            egret.DisplayObjectContainer.__EVENT__REMOVE_FROM_STAGE_LIST.push(this);
        };
        Object.defineProperty(DisplayObject.prototype, "stage", {
            /**
             * 显示对象的舞台。【只读】
             * 例如，您可以创建多个显示对象并加载到显示列表中，每个显示对象的 stage 属性是指相同的 Stage 对象。
             * 如果显示对象未添加到显示列表，则其 stage 属性会设置为 null。
             * @member {number} egret.DisplayObject#stage
             * @returns {egret.Stage}
             */
            get: function () {
                return this._stage;
            },
            enumerable: true,
            configurable: true
        });
        DisplayObject.prototype.addEventListener = function (type, listener, thisObject, useCapture, priority) {
            if (useCapture === void 0) { useCapture = false; }
            if (priority === void 0) { priority = 0; }
            _super.prototype.addEventListener.call(this, type, listener, thisObject, useCapture, priority);
            var isEnterFrame = (type == egret.Event.ENTER_FRAME);
            if (isEnterFrame || type == egret.Event.RENDER) {
                var list = isEnterFrame ? DisplayObject._enterFrameCallBackList : DisplayObject._renderCallBackList;
                this._insertEventBin(list, listener, thisObject, priority, this);
            }
        };
        DisplayObject.prototype.removeEventListener = function (type, listener, thisObject, useCapture) {
            if (useCapture === void 0) { useCapture = false; }
            _super.prototype.removeEventListener.call(this, type, listener, thisObject, useCapture);
            var isEnterFrame = (type == egret.Event.ENTER_FRAME);
            if (isEnterFrame || type == egret.Event.RENDER) {
                var list = isEnterFrame ? DisplayObject._enterFrameCallBackList : DisplayObject._renderCallBackList;
                this._removeEventBin(list, listener, thisObject, this);
            }
        };
        DisplayObject.prototype.dispatchEvent = function (event) {
            if (!event._bubbles) {
                return _super.prototype.dispatchEvent.call(this, event);
            }
            var list = [];
            var target = this;
            while (target) {
                list.push(target);
                target = target._parent;
            }
            event._reset();
            this._dispatchPropagationEvent(event, list);
            return !event._isDefaultPrevented;
        };
        DisplayObject.prototype._dispatchPropagationEvent = function (event, list, targetIndex) {
            var length = list.length;
            var eventPhase = 1;
            for (var i = length - 1; i >= 0; i--) {
                var currentTarget = list[i];
                event._currentTarget = currentTarget;
                event._target = this;
                event._eventPhase = eventPhase;
                currentTarget._notifyListener(event);
                if (event._isPropagationStopped || event._isPropagationImmediateStopped) {
                    return;
                }
            }
            var eventPhase = 2;
            var currentTarget = list[0];
            event._currentTarget = currentTarget;
            event._target = this;
            event._eventPhase = eventPhase;
            currentTarget._notifyListener(event);
            if (event._isPropagationStopped || event._isPropagationImmediateStopped) {
                return;
            }
            var eventPhase = 3;
            for (i = 1; i < length; i++) {
                var currentTarget = list[i];
                event._currentTarget = currentTarget;
                event._target = this;
                event._eventPhase = eventPhase;
                currentTarget._notifyListener(event);
                if (event._isPropagationStopped || event._isPropagationImmediateStopped) {
                    return;
                }
            }
        };
        DisplayObject.prototype.willTrigger = function (type) {
            var parent = this;
            while (parent) {
                if (parent.hasEventListener(type))
                    return true;
                parent = parent._parent;
            }
            return false;
        };
        Object.defineProperty(DisplayObject.prototype, "cacheAsBitmap", {
            get: function () {
                return this._cacheAsBitmap;
            },
            set: function (bool) {
                this._cacheAsBitmap = bool;
                if (bool) {
                    this._makeBitmapCache();
                }
                else {
                    this._texture_to_render = null;
                }
            },
            enumerable: true,
            configurable: true
        });
        DisplayObject.prototype._makeBitmapCache = function () {
            if (!this.renderTexture) {
                this.renderTexture = new egret.RenderTexture();
            }
            this.renderTexture.drawToTexture(this);
            this._texture_to_render = this.renderTexture;
        };
        DisplayObject.prototype._setCacheDirty = function (dirty) {
            if (dirty === void 0) { dirty = true; }
            this._cacheDirty = dirty;
        };
        DisplayObject.getTransformBounds = function (bounds, mtx) {
            var x = bounds.x, y = bounds.y;
            //            var x, y;
            var width = bounds.width, height = bounds.height;
            if (x || y) {
                mtx.appendTransform(0, 0, 1, 1, 0, 0, 0, -x, -y);
            }
            //        if (matrix) { mtx.prependMatrix(matrix); }
            var x_a = width * mtx.a, x_b = width * mtx.b;
            var y_c = height * mtx.c, y_d = height * mtx.d;
            var tx = mtx.tx, ty = mtx.ty;
            var minX = tx, maxX = tx, minY = ty, maxY = ty;
            if ((x = x_a + tx) < minX) {
                minX = x;
            }
            else if (x > maxX) {
                maxX = x;
            }
            if ((x = x_a + y_c + tx) < minX) {
                minX = x;
            }
            else if (x > maxX) {
                maxX = x;
            }
            if ((x = y_c + tx) < minX) {
                minX = x;
            }
            else if (x > maxX) {
                maxX = x;
            }
            if ((y = x_b + ty) < minY) {
                minY = y;
            }
            else if (y > maxY) {
                maxY = y;
            }
            if ((y = x_b + y_d + ty) < minY) {
                minY = y;
            }
            else if (y > maxY) {
                maxY = y;
            }
            if ((y = y_d + ty) < minY) {
                minY = y;
            }
            else if (y > maxY) {
                maxY = y;
            }
            return bounds.initialize(minX, minY, maxX - minX, maxY - minY);
        };
        Object.defineProperty(DisplayObject.prototype, "colorTransform", {
            get: function () {
                return this._colorTransform;
            },
            set: function (value) {
                this._colorTransform = value;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * @private
         * @returns {Matrix}
         */
        DisplayObject.identityMatrixForGetConcatenated = new egret.Matrix();
        DisplayObject._enterFrameCallBackList = [];
        DisplayObject._renderCallBackList = [];
        return DisplayObject;
    })(egret.EventDispatcher);
    egret.DisplayObject = DisplayObject;
    DisplayObject.prototype.__class__ = "egret.DisplayObject";
    var ColorTransform = (function () {
        function ColorTransform() {
            this.matrix = null;
        }
        ColorTransform.prototype.updateColor = function (r, g, b, a, addR, addG, addB, addA) {
            //todo;
        };
        return ColorTransform;
    })();
    egret.ColorTransform = ColorTransform;
    ColorTransform.prototype.__class__ = "egret.ColorTransform";
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var egret;
(function (egret) {
    /**
     * @class egret.DisplayObjectContainer
     * @classdesc
     * DisplayObjectContainer 类是可用作显示列表中显示对象容器的所有对象的基类。
     * 该显示列表管理运行时中显示的所有对象。使用 DisplayObjectContainer 类排列显示列表中的显示对象。每个 DisplayObjectContainer 对象都有自己的子级列表，用于组织对象的 Z 轴顺序。Z 轴顺序是由前至后的顺序，可确定哪个对象绘制在前，哪个对象绘制在后等。
     */
    var DisplayObjectContainer = (function (_super) {
        __extends(DisplayObjectContainer, _super);
        function DisplayObjectContainer() {
            _super.call(this);
            this._touchChildren = true;
            this._children = [];
        }
        Object.defineProperty(DisplayObjectContainer.prototype, "touchChildren", {
            /**
             * 指定此对象的子项以及子孙项是否接收鼠标/触摸事件
             * 默认值为 true 即可以接收。
             * @member {boolean} egret.DisplayObjectContainer#touchChildren
             */
            get: function () {
                return this._touchChildren;
            },
            set: function (value) {
                this._touchChildren = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DisplayObjectContainer.prototype, "numChildren", {
            /**
             * 返回此对象的子项数目。【只读】
             * @member {number} egret.DisplayObjectContainer#numChildren
             */
            get: function () {
                return this._children.length;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 更改现有子项在显示对象容器中的位置。这会影响子对象的分层。
         * @method egret.DisplayObjectContainer#setChildIndex
         * @param child {egret.DisplayObject} 要为其更改索引编号的 DisplayObject 子实例。
         * @param index {number} 生成的 child 显示对象的索引编号。当新的索引编号小于0或大于已有子元件数量时，新加入的DisplayObject对象将会放置于最上层。
         */
        DisplayObjectContainer.prototype.setChildIndex = function (child, index) {
            this.doSetChildIndex(child, index);
        };
        DisplayObjectContainer.prototype.doSetChildIndex = function (child, index) {
            var lastIdx = this._children.indexOf(child);
            if (lastIdx < 0) {
                egret.Logger.fatal("child不在当前容器内");
            }
            //从原来的位置删除
            this._children.splice(lastIdx, 1);
            //放到新的位置
            if (index < 0 || this._children.length <= index) {
                this._children.push(child);
            }
            else {
                this._children.splice(index, 0, child);
            }
        };
        /**
         * 将一个 DisplayObject 子实例添加到该 DisplayObjectContainer 实例中。子项将被添加到该 DisplayObjectContainer 实例中其他所有子项的前（上）面。（要将某子项添加到特定索引位置，请使用 addChildAt() 方法。）
         * @method egret.DisplayObjectContainer#addChild
         * @param child {egret.DisplayObject} 要作为该 DisplayObjectContainer 实例的子项添加的 DisplayObject 实例。
         * @returns {egret.DisplayObject} 在 child 参数中传递的 DisplayObject 实例。
         */
        DisplayObjectContainer.prototype.addChild = function (child) {
            var index = this._children.length;
            if (child._parent == this)
                index--;
            return this._doAddChild(child, index);
        };
        /**
         * 将一个 DisplayObject 子实例添加到该 DisplayObjectContainer 实例中。该子项将被添加到指定的索引位置。索引为 0 表示该 DisplayObjectContainer 对象的显示列表的后（底）部。如果索引值为-1，则表示该DisplayObjectContainer 对象的显示列表的前（上）部。
         * @method egret.DisplayObjectContainer#addChildAt
         * @param child {egret.DisplayObject} 要作为该 DisplayObjectContainer 实例的子项添加的 DisplayObject 实例。
         * @param index {number} 添加该子项的索引位置。 如果指定当前占用的索引位置，则该位置以及所有更高位置上的子对象会在子级列表中上移一个位置。
         * @returns {egret.DisplayObject} 在 child 参数中传递的 DisplayObject 实例。
         */
        DisplayObjectContainer.prototype.addChildAt = function (child, index) {
            return this._doAddChild(child, index);
        };
        DisplayObjectContainer.prototype._doAddChild = function (child, index, notifyListeners) {
            if (notifyListeners === void 0) { notifyListeners = true; }
            if (child == this)
                return child;
            if (index < 0 || index > this._children.length) {
                egret.Logger.fatal("提供的索引超出范围");
                return child;
            }
            var host = child._parent;
            if (host == this) {
                this.doSetChildIndex(child, index);
                return child;
            }
            if (host) {
                var index = host._children.indexOf(child);
                if (index >= 0) {
                    host._doRemoveChild(index);
                }
            }
            this._children.splice(index, 0, child);
            child._parentChanged(this);
            if (notifyListeners)
                child.dispatchEventWith(egret.Event.ADDED, true);
            if (this._stage) {
                child._onAddToStage();
                var list = DisplayObjectContainer.__EVENT__ADD_TO_STAGE_LIST;
                while (list.length > 0) {
                    var childAddToStage = list.shift();
                    childAddToStage.dispatchEventWith(egret.Event.ADDED_TO_STAGE);
                }
            }
            child._setDirty();
            this._setSizeDirty();
            return child;
        };
        /**
         * 将一个 DisplayObject 子实例从 DisplayObjectContainer 实例中移除。
         * @method egret.DisplayObjectContainer#removeChild
         * @param child {egret.DisplayObject} 要删除的 DisplayObject 实例。
         * @returns {egret.DisplayObject} 在 child 参数中传递的 DisplayObject 实例。
         */
        DisplayObjectContainer.prototype.removeChild = function (child) {
            var index = this._children.indexOf(child);
            if (index >= 0) {
                return this._doRemoveChild(index);
            }
            else {
                egret.Logger.fatal("child未被addChild到该parent");
                return null;
            }
        };
        /**
         * 从 DisplayObjectContainer 的子列表中指定的 index 位置删除子 DisplayObject。
         * @method egret.DisplayObjectContainer#removeChildAt
         * @param index {number} 要删除的 DisplayObject 的子索引。
         * @returns {egret.DisplayObject} 已删除的 DisplayObject 实例。
         */
        DisplayObjectContainer.prototype.removeChildAt = function (index) {
            if (index >= 0 && index < this._children.length) {
                return this._doRemoveChild(index);
            }
            else {
                egret.Logger.fatal("提供的索引超出范围");
                return null;
            }
        };
        DisplayObjectContainer.prototype._doRemoveChild = function (index, notifyListeners) {
            if (notifyListeners === void 0) { notifyListeners = true; }
            var locChildren = this._children;
            var child = locChildren[index];
            if (notifyListeners)
                child.dispatchEventWith(egret.Event.REMOVED, true);
            if (this._stage) {
                child._onRemoveFromStage();
                var list = DisplayObjectContainer.__EVENT__REMOVE_FROM_STAGE_LIST;
                while (list.length > 0) {
                    var childAddToStage = list.shift();
                    childAddToStage.dispatchEventWith(egret.Event.REMOVED_FROM_STAGE);
                    childAddToStage._stage = null;
                }
            }
            child._parentChanged(null);
            locChildren.splice(index, 1);
            this._setSizeDirty();
            return child;
        };
        /**
         * 返回位于指定索引处的子显示对象实例。
         * @method egret.DisplayObjectContainer#getChildAt
         * @param index {number} 子对象的索引位置。
         * @returns {egret.DisplayObject} 位于指定索引位置处的子显示对象。
         */
        DisplayObjectContainer.prototype.getChildAt = function (index) {
            if (index >= 0 && index < this._children.length) {
                return this._children[index];
            }
            else {
                egret.Logger.fatal("提供的索引超出范围");
                return null;
            }
        };
        /**
         * 确定指定显示对象是 DisplayObjectContainer 实例的子项还是该实例本身。搜索包括整个显示列表（其中包括此 DisplayObjectContainer 实例）。孙项、曾孙项等，每项都返回 true。
         * @method egret.DisplayObjectContainer#contains
         * @param child {egret.DisplayObject} 要测试的子对象。
         * @returns {boolean} 如果指定的显示对象为DisplayObjectContainer该实例本身，则返回true，如果指定的显示对象为当前实例子项，则返回false。
         */
        DisplayObjectContainer.prototype.contains = function (child) {
            while (child) {
                if (child == this) {
                    return true;
                }
                child = child._parent;
            }
            return false;
        };
        /**
         * 在子级列表中两个指定的索引位置，交换子对象的 Z 轴顺序（前后顺序）。显示对象容器中所有其他子对象的索引位置保持不变。
         * @method egret.DisplayObjectContainer#swapChildrenAt
         * @param index1 {number} 第一个子对象的索引位置。
         * @param index2 {number} 第二个子对象的索引位置。
         */
        DisplayObjectContainer.prototype.swapChildrenAt = function (index1, index2) {
            if (index1 >= 0 && index1 < this._children.length && index2 >= 0 && index2 < this._children.length) {
                this._swapChildrenAt(index1, index2);
            }
            else {
                egret.Logger.fatal("提供的索引超出范围");
            }
        };
        /**
         * 交换两个指定子对象的 Z 轴顺序（从前到后顺序）。显示对象容器中所有其他子对象的索引位置保持不变。
         * @method egret.DisplayObjectContainer#swapChildren
         * @param child1 {egret.DisplayObject} 第一个子对象。
         * @param child2 {egret.DisplayObject} 第二个子对象。
         */
        DisplayObjectContainer.prototype.swapChildren = function (child1, child2) {
            var index1 = this._children.indexOf(child1);
            var index2 = this._children.indexOf(child2);
            if (index1 == -1 || index2 == -1) {
                egret.Logger.fatal("child未被addChild到该parent");
            }
            else {
                this._swapChildrenAt(index1, index2);
            }
        };
        DisplayObjectContainer.prototype._swapChildrenAt = function (index1, index2) {
            if (index1 == index2) {
                return;
            }
            var list = this._children;
            var child = list[index1];
            list[index1] = list[index2];
            list[index2] = child;
        };
        /**
         * 返回 DisplayObject 的 child 实例的索引位置。
         * @method egret.DisplayObjectContainer#getChildIndex
         * @param child {egret.DisplayObject} 要标识的 DisplayObject 实例。
         * @returns {number} 要标识的子显示对象的索引位置。
         */
        DisplayObjectContainer.prototype.getChildIndex = function (child) {
            return this._children.indexOf(child);
        };
        /**
         * 从 DisplayObjectContainer 实例的子级列表中删除所有 child DisplayObject 实例。
         * @method egret.DisplayObjectContainer#removeChildren
         */
        DisplayObjectContainer.prototype.removeChildren = function () {
            var locChildren = this._children;
            for (var i = locChildren.length - 1; i >= 0; i--) {
                this._doRemoveChild(i);
            }
        };
        DisplayObjectContainer.prototype._updateTransform = function () {
            if (!this._visible) {
                return;
            }
            _super.prototype._updateTransform.call(this);
            for (var i = 0, length = this._children.length; i < length; i++) {
                var child = this._children[i];
                child._updateTransform();
            }
        };
        DisplayObjectContainer.prototype._render = function (renderContext) {
            for (var i = 0, length = this._children.length; i < length; i++) {
                var child = this._children[i];
                child._draw(renderContext);
            }
        };
        /**
         * @see egret.DisplayObject._measureBounds
         * @returns {null}
         * @private
         */
        DisplayObjectContainer.prototype._measureBounds = function () {
            var minX = 0, maxX = 0, minY = 0, maxY = 0;
            var l = this._children.length;
            for (var i = 0; i < l; i++) {
                var child = this._children[i];
                if (!child._visible) {
                    continue;
                }
                var childBounds = child.getBounds(egret.Rectangle.identity, false);
                var childBoundsX = childBounds.x;
                var childBoundsY = childBounds.y;
                var childBoundsW = childBounds.width;
                var childBoundsH = childBounds.height;
                var childMatrix = child._getMatrix();
                var bounds = egret.DisplayObject.getTransformBounds(egret.Rectangle.identity.initialize(childBoundsX, childBoundsY, childBoundsW, childBoundsH), childMatrix);
                var x1 = bounds.x, y1 = bounds.y, x2 = bounds.width + bounds.x, y2 = bounds.height + bounds.y;
                if (x1 < minX || i == 0) {
                    minX = x1;
                }
                if (x2 > maxX || i == 0) {
                    maxX = x2;
                }
                if (y1 < minY || i == 0) {
                    minY = y1;
                }
                if (y2 > maxY || i == 0) {
                    maxY = y2;
                }
            }
            return egret.Rectangle.identity.initialize(minX, minY, maxX - minX, maxY - minY);
        };
        /**
         * 检测指定坐标是否在显示对象内
         * @method egret.DisplayObjectContainer#hitTest
         * @see egret.DisplayObject.hitTest
         * @param x {number} 检测坐标的x轴
         * @param y {number} 检测坐标的y轴
         * @param ignoreTouchEnabled {boolean} 是否忽略TouchEnabled
         * @returns {egret.DisplayObject} 返回所发生碰撞的DisplayObject对象
         */
        DisplayObjectContainer.prototype.hitTest = function (x, y, ignoreTouchEnabled) {
            if (ignoreTouchEnabled === void 0) { ignoreTouchEnabled = false; }
            var result;
            if (!this._visible) {
                return null;
            }
            if (this._scrollRect) {
                if (x < this._scrollRect.x || y < this._scrollRect.y || x > this._scrollRect.x + this._scrollRect.width || y > this._scrollRect.y + this._scrollRect.height) {
                    return null;
                }
            }
            else if (this.mask) {
                if (this.mask.x > x || x > this.mask.x + this.mask.width || this.mask.y > y || y > this.mask.y + this.mask.height) {
                    return null;
                }
            }
            var children = this._children;
            var l = children.length;
            var touchChildren = this._touchChildren; //这里不用考虑父级的touchChildren，从父级调用下来过程中已经判断过了。
            for (var i = l - 1; i >= 0; i--) {
                var child = children[i];
                var mtx = child._getMatrix();
                var scrollRect = child._scrollRect;
                if (scrollRect) {
                    mtx.append(1, 0, 0, 1, -scrollRect.x, -scrollRect.y);
                }
                mtx.invert();
                var point = egret.Matrix.transformCoords(mtx, x, y);
                var childHitTestResult = child.hitTest(point.x, point.y, true);
                if (childHitTestResult) {
                    if (!touchChildren) {
                        return this;
                    }
                    if (childHitTestResult._touchEnabled && touchChildren) {
                        return childHitTestResult;
                    }
                    result = this;
                }
            }
            if (result) {
                return result;
            }
            else if (this._texture_to_render || this["graphics"]) {
                return _super.prototype.hitTest.call(this, x, y, ignoreTouchEnabled);
            }
            return null;
        };
        DisplayObjectContainer.prototype._onAddToStage = function () {
            _super.prototype._onAddToStage.call(this);
            var length = this._children.length;
            for (var i = 0; i < length; i++) {
                var child = this._children[i];
                child._onAddToStage();
            }
        };
        DisplayObjectContainer.prototype._onRemoveFromStage = function () {
            _super.prototype._onRemoveFromStage.call(this);
            var length = this._children.length;
            for (var i = 0; i < length; i++) {
                var child = this._children[i];
                child._onRemoveFromStage();
            }
        };
        /**
         * 返回具有指定名称的子显示对象。
         * @method egret.DisplayObjectContainer#getChildByName
         * @param name {string} 要返回的子项的名称。
         * @returns {egret.DisplayObject} 具有指定名称的子显示对象。
         */
        DisplayObjectContainer.prototype.getChildByName = function (name) {
            var locChildren = this._children;
            var length = locChildren.length;
            var displayObject;
            for (var i = 0; i < length; i++) {
                displayObject = locChildren[i];
                if (displayObject.name == name) {
                    return displayObject;
                }
            }
            return null;
        };
        DisplayObjectContainer.__EVENT__ADD_TO_STAGE_LIST = [];
        DisplayObjectContainer.__EVENT__REMOVE_FROM_STAGE_LIST = [];
        return DisplayObjectContainer;
    })(egret.DisplayObject);
    egret.DisplayObjectContainer = DisplayObjectContainer;
    DisplayObjectContainer.prototype.__class__ = "egret.DisplayObjectContainer";
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var egret;
(function (egret) {
    /**
     * @class egret.Stage
     * @classdesc Stage 类代表主绘图区。
     */
    var Stage = (function (_super) {
        __extends(Stage, _super);
        function Stage(width, height) {
            if (width === void 0) { width = 480; }
            if (height === void 0) { height = 800; }
            _super.call(this);
            this.touchEnabled = true;
            this._stage = this;
            this._stageWidth = width;
            this._stageHeight = height;
        }
        /**
         * 调用 invalidate() 方法后，在显示列表下次呈现时，Egret 会向每个已注册侦听 render 事件的显示对象发送一个 render 事件。
         * 每次您希望 Egret 发送 render 事件时，都必须调用 invalidate() 方法。
         * @method egret.Stage#invalidate
         */
        Stage.prototype.invalidate = function () {
            Stage._invalidateRenderFlag = true;
        };
        Object.defineProperty(Stage.prototype, "scaleMode", {
            get: function () {
                return this._scaleMode;
            },
            set: function (value) {
                if (this._scaleMode != value) {
                    this._scaleMode = value;
                    var scaleModeEnum = {};
                    scaleModeEnum[egret.StageScaleMode.NO_SCALE] = new egret.NoScale();
                    scaleModeEnum[egret.StageScaleMode.SHOW_ALL] = new egret.ShowAll();
                    scaleModeEnum[egret.StageScaleMode.NO_BORDER] = new egret.FixedWidth();
                    scaleModeEnum[egret.StageScaleMode.EXACT_FIT] = new egret.FullScreen();
                    var content = scaleModeEnum[value];
                    if (!content) {
                        throw new Error("使用了尚未实现的ScaleMode");
                    }
                    var container = new egret.EqualToFrame();
                    var policy = new egret.ResolutionPolicy(container, content);
                    egret.StageDelegate.getInstance()._setResolutionPolicy(policy);
                    this._stageWidth = egret.StageDelegate.getInstance()._stageWidth;
                    this._stageHeight = egret.StageDelegate.getInstance()._stageHeight;
                    this.dispatchEventWith(egret.Event.RESIZE);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Stage.prototype, "stageWidth", {
            /**
             * 舞台宽度（坐标系宽度，非设备宽度）
             * @member {number} egret.Stage#stageWidth
             */
            get: function () {
                return this._stageWidth;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Stage.prototype, "stageHeight", {
            /**
             * 舞台高度（坐标系高度，非设备高度）
             * @member {number} egret.Stage#stageHeight
             */
            get: function () {
                return this._stageHeight;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * @member egret.Stage#hitTest
         * @see egret.DisplayObject#hitTest
         * @param x
         * @param y
         * @returns {egret.DisplayObject}
         */
        Stage.prototype.hitTest = function (x, y, ignoreTouchEnabled) {
            if (ignoreTouchEnabled === void 0) { ignoreTouchEnabled = false; }
            if (!this._touchEnabled) {
                return null;
            }
            var result;
            if (!this._touchChildren) {
                return this;
            }
            var children = this._children;
            var l = children.length;
            for (var i = l - 1; i >= 0; i--) {
                var child = children[i];
                var mtx = child._getMatrix();
                var scrollRect = child._scrollRect;
                if (scrollRect) {
                    mtx.append(1, 0, 0, 1, -scrollRect.x, -scrollRect.y);
                }
                mtx.invert();
                var point = egret.Matrix.transformCoords(mtx, x, y);
                result = child.hitTest(point.x, point.y, true);
                if (result) {
                    if (result._touchEnabled) {
                        return result;
                    }
                }
            }
            return this;
        };
        /**
         * 返回舞台尺寸范围
         * @member egret.Stage#getBounds
         * @see egret.DisplayObject#getBounds
         * @param resultRect {egret.Rectangle} 可选参数，传入用于保存结果的Rectangle对象，避免重复创建对象。
         * @returns {egret.Rectangle}
         */
        Stage.prototype.getBounds = function (resultRect) {
            if (!resultRect) {
                resultRect = new egret.Rectangle();
            }
            return resultRect.initialize(0, 0, this._stageWidth, this._stageHeight);
        };
        Stage.prototype._updateTransform = function () {
            for (var i = 0, length = this._children.length; i < length; i++) {
                var child = this._children[i];
                child._updateTransform();
            }
        };
        Object.defineProperty(Stage.prototype, "focus", {
            get: function () {
                return null;
            },
            enumerable: true,
            configurable: true
        });
        Stage._invalidateRenderFlag = false;
        return Stage;
    })(egret.DisplayObjectContainer);
    egret.Stage = Stage;
    Stage.prototype.__class__ = "egret.Stage";
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var egret;
(function (egret) {
    /**
     * StageScaleMode 类为 Stage.scaleMode 属性提供值。
     * @class egret.StageScaleMode
     */
    var StageScaleMode = (function () {
        function StageScaleMode() {
        }
        /**
         * 指定整个应用程序填满指定区域，不会发生扭曲，但有可能会进行一些裁切，同时保持应用程序的原始高宽比。
         * @member {string} egret.StageScaleMode.NO_BORDER
         */
        StageScaleMode.NO_BORDER = "noBorder";
        /**
         * 指定应用程序的大小是固定的，因此，即使在更改播放器窗口大小时，它仍然保持不变。如果播放器窗口比内容小，则可能进行一些裁切。
         * @member {string} egret.StageScaleMode.NO_SCALE
         */
        StageScaleMode.NO_SCALE = "noScale";
        /**
         * 指定整个应用程序在指定区域中可见，且不会发生扭曲，同时保持应用程序的原始高宽比。应用程序的两侧可能会显示边框。
         * @member {string} egret.StageScaleMode.SHOW_ALL
         */
        StageScaleMode.SHOW_ALL = "showAll";
        /**
         * 指定整个应用程序在指定区域中可见，但不尝试保持原始高宽比。可能会发生扭曲。
         * @member {string} egret.StageScaleMode.EXACT_FIT
         */
        StageScaleMode.EXACT_FIT = "exactFit";
        return StageScaleMode;
    })();
    egret.StageScaleMode = StageScaleMode;
    StageScaleMode.prototype.__class__ = "egret.StageScaleMode";
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var egret;
(function (egret) {
    /**
     * @class egret.ScrollView
     * @classdesc
     * ScrollView 是用于滑动的辅助类，将一个显示对象传入构造函数即可
     * @extends egret.DisplayObjectContainer
     */
    var ScrollView = (function (_super) {
        __extends(ScrollView, _super);
        /**
         * 创建一个 egret.ScrollView 对象
         * @method egret.ScrollView#constructor
         * @param content {egret.DisplayObject} 需要滚动的对象
         */
        function ScrollView(content) {
            if (content === void 0) { content = null; }
            _super.call(this);
            this._lastTouchPosition = new egret.Point(0, 0);
            this._lastTouchTime = 0;
            this._lastTouchEvent = null;
            this._velocitys = [];
            this._content = null;
            this._verticalScrollPolicy = "auto";
            this._horizontalScrollPolicy = "auto";
            this._scrollLeft = 0;
            this._scrollTop = 0;
            this._hCanScroll = false;
            this._vCanScroll = false;
            this.touchEnabled = true;
            if (content) {
                this.setContent(content);
            }
        }
        /**
         * 设置需要滚动的对象
         * @method egret.ScrollView#setContent
         * @param content {egret.DisplayObject} 需要滚动的对象
         */
        ScrollView.prototype.setContent = function (content) {
            if (this._content) {
                this._removeEvents();
                _super.prototype.removeChildAt.call(this, 0);
            }
            this._content = content;
            _super.prototype.addChild.call(this, content);
            this._addEvents();
            var w = this._explicitWidth || this._getContentWidth();
            var h = this._explicitHeight || this._getContentHeight();
            //this.scrollRect = new Rectangle(0, 0, w, h);
        };
        Object.defineProperty(ScrollView.prototype, "verticalScrollPolicy", {
            /**
             * 垂直滚动条显示策略，on/off/auto。
             * @member egret.ScrollView#verticalScrollPolicy
             */
            get: function () {
                return this._verticalScrollPolicy;
            },
            set: function (value) {
                if (value == this._verticalScrollPolicy)
                    return;
                this._verticalScrollPolicy = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ScrollView.prototype, "horizontalScrollPolicy", {
            /**
             * 水平滚动条显示策略，on/off/auto。
             * @member egret.ScrollView#horizontalScrollPolicy
             */
            get: function () {
                return this._horizontalScrollPolicy;
            },
            set: function (value) {
                if (value == this._horizontalScrollPolicy)
                    return;
                this._horizontalScrollPolicy = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ScrollView.prototype, "scrollLeft", {
            /**
             * 获取或设置水平滚动位置,
             * @member {number} egret.ScrollView#scrollLeft
             * @returns {number}
             */
            get: function () {
                return this._scrollLeft;
            },
            set: function (value) {
                if (value == this._scrollLeft)
                    return;
                this._scrollLeft = value;
                this._updateContentPosition();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ScrollView.prototype, "scrollTop", {
            /**
             * 获取或设置垂直滚动位置,
             * @member {number} egret.ScrollView#scrollTop
             * @returns {number}
             */
            get: function () {
                return this._scrollTop;
            },
            set: function (value) {
                if (value == this._scrollTop)
                    return;
                this._scrollTop = value;
                this._updateContentPosition();
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 设置滚动位置
         * @method egret.ScrollView#setScrollPosition
         * @param top {number} 垂直滚动位置
         * @param left {number} 水平滚动位置
         * @param isOffset {boolean} 可选参数，默认是false，是否是滚动增加量，如 top=1 代表往上滚动1像素
         */
        ScrollView.prototype.setScrollPosition = function (top, left, isOffset) {
            if (isOffset === void 0) { isOffset = false; }
            if (isOffset && top == 0 && left == 0)
                return;
            if (!isOffset && this._scrollTop == top && this._scrollLeft == left)
                return;
            if (isOffset) {
                this._scrollTop += top;
                this._scrollLeft += left;
            }
            else {
                this._scrollTop = top;
                this._scrollLeft = left;
            }
            this._updateContentPosition();
        };
        /**
         * @inheritDoc
         */
        ScrollView.prototype._setWidth = function (value) {
            if (this._explicitWidth == value)
                return;
            _super.prototype._setWidth.call(this, value);
            this._updateContentPosition();
        };
        /**
         * @inheritDoc
         */
        ScrollView.prototype._setHeight = function (value) {
            if (this._explicitHeight == value)
                return;
            _super.prototype._setHeight.call(this, value);
            this._updateContentPosition();
        };
        ScrollView.prototype._updateContentPosition = function () {
            this.scrollRect = new egret.Rectangle(this._scrollLeft, this._scrollTop, this.width, this.height);
            this.dispatchEvent(new egret.Event(egret.Event.CHANGE));
        };
        ScrollView.prototype._checkScrollPolicy = function () {
            var hpolicy = this._horizontalScrollPolicy;
            var hCanScroll = this.__checkScrollPolicy(hpolicy, this._getContentWidth(), this.width);
            this._hCanScroll = hCanScroll;
            var vpolicy = this._verticalScrollPolicy;
            var vCanScroll = this.__checkScrollPolicy(vpolicy, this._getContentHeight(), this.height);
            this._vCanScroll = vCanScroll;
            return hCanScroll || vCanScroll;
        };
        ScrollView.prototype.__checkScrollPolicy = function (policy, contentLength, viewLength) {
            if (policy == "on")
                return true;
            if (policy == "off")
                return false;
            return contentLength > viewLength;
        };
        ScrollView.prototype._addEvents = function () {
            this.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this._onTouchBegin, this);
            this.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this._onTouchBeginCapture, this, true);
            this.addEventListener(egret.TouchEvent.TOUCH_END, this._onTouchEndCapture, this, true);
        };
        ScrollView.prototype._removeEvents = function () {
            this.removeEventListener(egret.TouchEvent.TOUCH_BEGIN, this._onTouchBegin, this);
            this.removeEventListener(egret.TouchEvent.TOUCH_BEGIN, this._onTouchBeginCapture, this, true);
            this.removeEventListener(egret.TouchEvent.TOUCH_END, this._onTouchEndCapture, this, true);
        };
        ScrollView.prototype._onTouchBegin = function (e) {
            if (e._isDefaultPrevented)
                return;
            egret.Tween.removeTweens(this);
            this.stage.addEventListener(egret.TouchEvent.TOUCH_MOVE, this._onTouchMove, this);
            this.stage.addEventListener(egret.TouchEvent.TOUCH_END, this._onTouchEnd, this);
            this.stage.addEventListener(egret.TouchEvent.LEAVE_STAGE, this._onTouchEnd, this);
            this.addEventListener(egret.Event.ENTER_FRAME, this._onEnterFrame, this);
            this._logTouchEvent(e);
            e.preventDefault();
        };
        ScrollView.prototype._onTouchBeginCapture = function (event) {
            var canScroll = this._checkScrollPolicy();
            if (!canScroll) {
                return;
            }
            var target = event.target;
            while (target != this) {
                if (target instanceof ScrollView) {
                    canScroll = target._checkScrollPolicy();
                    if (canScroll) {
                        return;
                    }
                }
                target = target.parent;
            }
            event.stopPropagation();
            var evt = this.cloneTouchEvent(event);
            this.delayTouchBeginEvent = evt;
            if (!this.touchBeginTimer) {
                this.touchBeginTimer = new egret.Timer(100, 1);
                this.touchBeginTimer.addEventListener(egret.TimerEvent.TIMER_COMPLETE, this._onTouchBeginTimer, this);
            }
            this.touchBeginTimer.start();
            this._onTouchBegin(event);
        };
        ScrollView.prototype._onTouchEndCapture = function (event) {
            if (!this.delayTouchBeginEvent) {
                return;
            }
            this._onTouchBeginTimer();
        };
        ScrollView.prototype._onTouchBeginTimer = function () {
            this.touchBeginTimer.stop();
            var event = this.delayTouchBeginEvent;
            this.delayTouchBeginEvent = null;
            this.dispatchPropagationEvent(event);
        };
        ScrollView.prototype.dispatchPropagationEvent = function (event) {
            var list = [];
            var target = event._target;
            while (target) {
                list.push(target);
                target = target.parent;
            }
            var content = this._content;
            for (var i = 1;; i += 2) {
                target = list[i];
                if (!target || target === content) {
                    break;
                }
                list.unshift(target);
            }
            this._dispatchPropagationEvent(event, list);
        };
        //todo 此处代码是为了兼容之前的实现，应该尽快更优化的实现后删除
        ScrollView.prototype._dispatchPropagationEvent = function (event, list, targetIndex) {
            var length = list.length;
            for (var i = 0; i < length; i++) {
                var currentTarget = list[i];
                event._currentTarget = currentTarget;
                event._target = this;
                if (i < targetIndex)
                    event._eventPhase = 1;
                else if (i == targetIndex)
                    event._eventPhase = 2;
                else
                    event._eventPhase = 3;
                currentTarget._notifyListener(event);
                if (event._isPropagationStopped || event._isPropagationImmediateStopped) {
                    break;
                }
            }
        };
        ScrollView.prototype._onTouchMove = function (event) {
            if (this.delayTouchBeginEvent) {
                this.delayTouchBeginEvent = null;
                this.touchBeginTimer.stop();
            }
            var offset = this._getPointChange(event);
            this.setScrollPosition(offset.y, offset.x, true);
            this._calcVelocitys(event);
            this._logTouchEvent(event);
        };
        ScrollView.prototype._onTouchEnd = function (event) {
            this.stage.removeEventListener(egret.TouchEvent.TOUCH_MOVE, this._onTouchMove, this);
            this.stage.removeEventListener(egret.TouchEvent.TOUCH_END, this._onTouchEnd, this);
            this.stage.removeEventListener(egret.TouchEvent.LEAVE_STAGE, this._onTouchEnd, this);
            this.removeEventListener(egret.Event.ENTER_FRAME, this._onEnterFrame, this);
            this._moveAfterTouchEnd();
        };
        ScrollView.prototype._onEnterFrame = function (event) {
            var time = egret.getTimer();
            if (time - this._lastTouchTime > 100 && time - this._lastTouchTime < 300) {
                this._calcVelocitys(this._lastTouchEvent);
            }
        };
        ScrollView.prototype._logTouchEvent = function (e) {
            this._lastTouchPosition.x = e.stageX;
            this._lastTouchPosition.y = e.stageY;
            this._lastTouchEvent = this.cloneTouchEvent(e);
            this._lastTouchTime = egret.getTimer();
        };
        ScrollView.prototype._getPointChange = function (e) {
            return {
                x: this._hCanScroll === false ? 0 : (this._lastTouchPosition.x - e.stageX),
                y: this._vCanScroll === false ? 0 : (this._lastTouchPosition.y - e.stageY)
            };
        };
        ScrollView.prototype._calcVelocitys = function (e) {
            var time = egret.getTimer();
            if (this._lastTouchTime == 0) {
                this._lastTouchTime = time;
                return;
            }
            var change = this._getPointChange(e);
            var timeoffset = time - this._lastTouchTime;
            change.x /= timeoffset;
            change.y /= timeoffset;
            this._velocitys.push(change);
            if (this._velocitys.length > 5)
                this._velocitys.shift();
            this._lastTouchPosition.x = e.stageX;
            this._lastTouchPosition.y = e.stageY;
        };
        ScrollView.prototype._getContentWidth = function () {
            return this._content.explicitWidth || this._content.width;
        };
        ScrollView.prototype._getContentHeight = function () {
            return this._content.explicitHeight || this._content.height;
        };
        ScrollView.prototype.getMaxScrollLeft = function () {
            var max = this._getContentWidth() - this.width;
            return Math.max(0, max);
        };
        ScrollView.prototype.getMaxScrollTop = function () {
            var max = this._getContentHeight() - this.height;
            return Math.max(0, max);
        };
        ScrollView.prototype._moveAfterTouchEnd = function () {
            if (this._velocitys.length == 0)
                return;
            var sum = { x: 0, y: 0 }, totalW = 0;
            for (var i = 0; i < this._velocitys.length; i++) {
                var v = this._velocitys[i];
                var w = ScrollView.weight[i];
                sum.x += v.x * w;
                sum.y += v.y * w;
                totalW += w;
            }
            this._velocitys.length = 0;
            var x = sum.x / totalW, y = sum.y / totalW;
            var pixelsPerMSX = Math.abs(x), pixelsPerMSY = Math.abs(y);
            var maxLeft = this.getMaxScrollLeft();
            var maxTop = this.getMaxScrollTop();
            var datax = pixelsPerMSX > 0.02 ? this.getAnimationDatas(x, this._scrollLeft, maxLeft) : { position: this._scrollLeft, duration: 1 };
            var datay = pixelsPerMSY > 0.02 ? this.getAnimationDatas(y, this._scrollTop, maxTop) : { position: this._scrollTop, duration: 1 };
            this.setScrollLeft(datax.position, datax.duration);
            this.setScrollTop(datay.position, datay.duration);
        };
        ScrollView.prototype.setScrollTop = function (scrollTop, duration) {
            if (duration === void 0) { duration = 0; }
            var finalPosition = Math.min(this.getMaxScrollTop(), Math.max(scrollTop, 0));
            if (duration == 0) {
                this.scrollTop = finalPosition;
                return null;
            }
            var twy = egret.Tween.get(this).to({ scrollTop: scrollTop }, duration, egret.Ease.quartOut);
            if (finalPosition != scrollTop) {
                twy.to({ scrollTop: finalPosition }, 300, egret.Ease.quintOut);
            }
        };
        ScrollView.prototype.setScrollLeft = function (scrollLeft, duration) {
            if (duration === void 0) { duration = 0; }
            var finalPosition = Math.min(this.getMaxScrollLeft(), Math.max(scrollLeft, 0));
            if (duration == 0) {
                this.scrollLeft = finalPosition;
                return null;
            }
            var tw = egret.Tween.get(this).to({ scrollLeft: scrollLeft }, duration, egret.Ease.quartOut);
            if (finalPosition != scrollLeft) {
                tw.to({ scrollLeft: finalPosition }, 300, egret.Ease.quintOut);
            }
        };
        ScrollView.prototype.getAnimationDatas = function (pixelsPerMS, curPos, maxPos) {
            var absPixelsPerMS = Math.abs(pixelsPerMS);
            var extraFricition = 0.95;
            var duration = 0;
            var friction = 0.998;
            var minVelocity = 0.02;
            var posTo = curPos + pixelsPerMS * 500;
            if (posTo < 0 || posTo > maxPos) {
                posTo = curPos;
                while (Math.abs(pixelsPerMS) != Infinity && Math.abs(pixelsPerMS) > minVelocity) {
                    posTo += pixelsPerMS;
                    if (posTo < 0 || posTo > maxPos) {
                        pixelsPerMS *= friction * extraFricition;
                    }
                    else {
                        pixelsPerMS *= friction;
                    }
                    duration++;
                }
            }
            else {
                duration = -Math.log(minVelocity / absPixelsPerMS) * 500;
            }
            var result = {
                position: Math.min(maxPos + 50, Math.max(posTo, -50)),
                duration: duration
            };
            return result;
        };
        ScrollView.prototype.cloneTouchEvent = function (event) {
            var evt = new egret.TouchEvent(event._type, event._bubbles, event.cancelable);
            evt.touchPointID = event.touchPointID;
            evt._stageX = event._stageX;
            evt._stageY = event._stageY;
            evt.ctrlKey = event.ctrlKey;
            evt.altKey = event.altKey;
            evt.shiftKey = event.shiftKey;
            evt.touchDown = event.touchDown;
            evt._isDefaultPrevented = false;
            evt._target = event._target;
            return evt;
        };
        ScrollView.prototype.throwNotSupportedError = function () {
            throw new Error("此方法在ScrollView内不可用!");
        };
        /**
         * @method egret.ScrollView#addChild
         * @deprecated
         * @param child {DisplayObject}
         * @returns {DisplayObject}
         */
        ScrollView.prototype.addChild = function (child) {
            this.throwNotSupportedError();
            return null;
        };
        /**
         * @method egret.ScrollView#addChildAt
         * @deprecated
         * @param child {DisplayObject}
         * @param index {number}
         * @returns {DisplayObject}
         */
        ScrollView.prototype.addChildAt = function (child, index) {
            this.throwNotSupportedError();
            return null;
        };
        /**
         * @method egret.ScrollView#removeChild
         * @deprecated
         * @param child {DisplayObject}
         * @returns {DisplayObject}
         */
        ScrollView.prototype.removeChild = function (child) {
            this.throwNotSupportedError();
            return null;
        };
        /**
         * @method egret.ScrollView#removeChildAt
         * @deprecated
         * @param index {number}
         * @returns {DisplayObject}
         */
        ScrollView.prototype.removeChildAt = function (index) {
            this.throwNotSupportedError();
            return null;
        };
        /**
         * @method egret.ScrollView#setChildIndex
         * @deprecated
         * @param child {DisplayObject}
         * @param index {number}
         */
        ScrollView.prototype.setChildIndex = function (child, index) {
            this.throwNotSupportedError();
        };
        /**
         * @method egret.ScrollView#swapChildren
         * @deprecated
         * @param child1 {DisplayObject}
         * @param child2 {DisplayObject}
         */
        ScrollView.prototype.swapChildren = function (child1, child2) {
            this.throwNotSupportedError();
        };
        /**
         * @method egret.ScrollView#swapChildrenAt
         * @deprecated
         * @param index1 {number}
         * @param index2 {number}
         */
        ScrollView.prototype.swapChildrenAt = function (index1, index2) {
            this.throwNotSupportedError();
        };
        ScrollView.weight = [1, 1.33, 1.66, 2, 2.33];
        return ScrollView;
    })(egret.DisplayObjectContainer);
    egret.ScrollView = ScrollView;
    ScrollView.prototype.__class__ = "egret.ScrollView";
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var egret;
(function (egret) {
    /**
     * @class egret.Scroller
     * @classdesc
     * egret.Scroller已废弃，请使用egret.ScrollView
     * @extends egret.DisplayObject
     */
    var Scroller = (function (_super) {
        __extends(Scroller, _super);
        /**
         * egret.Scroller已废弃，请使用egret.ScrollView
         * @method egret.Scroller#constructor
         * @param content {egret.DisplayObject} 需要滚动的对象
         * @param width {number} Scroller的宽度，默认值为content的宽度
         * @param height {number} Scroller的高度，默认值为content的高度
         */
        function Scroller(content, width, height) {
            if (width === void 0) { width = NaN; }
            if (height === void 0) { height = NaN; }
            _super.call(this, content);
            this.content = content;
            this.width = width == NaN ? this._getContentWidth() : width;
            this.height = height == NaN ? this._getContentHeight() : height;
            egret.Logger.warning("egret.Scroller已废弃，请使用egret.ScrollView");
        }
        Object.defineProperty(Scroller.prototype, "scrollXEnabled", {
            /**
             * 是否启用水平滚动
             * @member {boolean} egret.Scroller#scrollXEnabled
             * @returns {boolean}
             */
            get: function () {
                return this.horizontalScrollPolicy != "off";
            },
            set: function (value) {
                egret.Logger.warning("egret.Scroller已废弃，请使用egret.ScrollView");
                this.horizontalScrollPolicy = value ? "auto" : "off";
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Scroller.prototype, "scrollYEnabled", {
            /**
             * 是否启用垂直滚动
             * @member {boolean} egret.Scroller#scrollYEnabled
             * @returns {boolean}
             */
            get: function () {
                return this.verticalScrollPolicy != "off";
            },
            set: function (value) {
                egret.Logger.warning("egret.Scroller已废弃，请使用egret.ScrollView");
                this.verticalScrollPolicy = value ? "auto" : "off";
            },
            enumerable: true,
            configurable: true
        });
        return Scroller;
    })(egret.ScrollView);
    egret.Scroller = Scroller;
    Scroller.prototype.__class__ = "egret.Scroller";
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var egret;
(function (egret) {
    /**
     * @class egret.BitmapFillMode
     * @classdesc
     * BitmapFillMode 类定义Bitmap的图像填充方式。
     * BitmapFillMode 类定义了调整大小模式的一个枚举，这些模式确定 Bitmap 如何填充由布局系统指定的尺寸。
     */
    var BitmapFillMode = (function () {
        function BitmapFillMode() {
        }
        /**
         * 重复位图以填充区域。
         * @constant {string} egret.BitmapFillMode.REPEAT
         */
        BitmapFillMode.REPEAT = "repeat";
        /**
         * 位图填充拉伸以填充区域。
         * @constant {string} egret.BitmapFillMode.SCALE
         */
        BitmapFillMode.SCALE = "scale";
        return BitmapFillMode;
    })();
    egret.BitmapFillMode = BitmapFillMode;
    BitmapFillMode.prototype.__class__ = "egret.BitmapFillMode";
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var egret;
(function (egret) {
    /**
     * @class egret.Bitmap
     * @classdesc
     * Bitmap 类表示用于表示位图图像的显示对象。
     * @extends egret.DisplayObject
     */
    var Bitmap = (function (_super) {
        __extends(Bitmap, _super);
        function Bitmap(texture) {
            _super.call(this);
            /**
             * 单个Bitmap是否开启DEBUG模式
             * @member {boolean} egret.Bitmap#debug
             */
            this.debug = false;
            /**
             * debug边框颜色，默认值为红色
             * @member {number} egret.Bitmap#debugColor
             */
            this.debugColor = 0xff0000;
            /**
             * 矩形区域，它定义位图对象的九个缩放区域。此属性仅当fillMode为BitmapFillMode.SCALE时有效。
             * scale9Grid的x、y、width、height分别代表九宫图中中间那块的左上点的x、y以及中间方块的宽高。
             * @member {egret.Texture} egret.Bitmap#scale9Grid
             */
            this.scale9Grid = null;
            /**
             * 确定位图填充尺寸的方式。
             * 设置为 BitmapFillMode.REPEAT时，位图将重复以填充区域；BitmapFillMode.SCALE时，位图将拉伸以填充区域。
             * 默认值：BitmapFillMode.SCALE。
             * @member {egret.Texture} egret.Bitmap#fillMode
             */
            this.fillMode = "scale";
            if (texture) {
                this._texture = texture;
                this._setSizeDirty();
            }
        }
        Object.defineProperty(Bitmap.prototype, "texture", {
            /**
             * 渲染纹理
             * @member {egret.Texture} egret.Bitmap#texture
             */
            get: function () {
                return this._texture;
            },
            set: function (value) {
                if (value == this._texture) {
                    return;
                }
                this._setSizeDirty();
                this._texture = value;
            },
            enumerable: true,
            configurable: true
        });
        Bitmap.prototype._render = function (renderContext) {
            var texture = this._texture;
            if (!texture) {
                this._texture_to_render = null;
                return;
            }
            this._texture_to_render = texture;
            var destW = this._hasWidthSet ? this._explicitWidth : texture._textureWidth;
            var destH = this._hasHeightSet ? this._explicitHeight : texture._textureHeight;
            Bitmap._drawBitmap(renderContext, destW, destH, this);
        };
        Bitmap._drawBitmap = function (renderContext, destW, destH, thisObject) {
            var texture = thisObject._texture_to_render;
            if (!texture) {
                return;
            }
            var textureWidth = texture._textureWidth;
            var textureHeight = texture._textureHeight;
            if (thisObject.fillMode == "scale") {
                var s9g = thisObject.scale9Grid || texture["scale9Grid"];
                if (s9g && textureWidth - s9g.width < destW && textureHeight - s9g.height < destH) {
                    Bitmap.drawScale9GridImage(renderContext, thisObject, s9g, destW, destH);
                }
                else {
                    var offsetX = texture._offsetX;
                    var offsetY = texture._offsetY;
                    var bitmapWidth = texture._bitmapWidth || textureWidth;
                    var bitmapHeight = texture._bitmapHeight || textureHeight;
                    var scaleX = destW / textureWidth;
                    offsetX = Math.round(offsetX * scaleX);
                    destW = Math.round(bitmapWidth * scaleX);
                    var scaleY = destH / textureHeight;
                    offsetY = Math.round(offsetY * scaleY);
                    destH = Math.round(bitmapHeight * scaleY);
                    Bitmap.renderFilter.drawImage(renderContext, thisObject, texture._bitmapX, texture._bitmapY, bitmapWidth, bitmapHeight, offsetX, offsetY, destW, destH);
                }
            }
            else {
                Bitmap.drawRepeatImage(renderContext, thisObject, destW, destH, thisObject.fillMode);
            }
        };
        /**
         * 绘制平铺位图
         */
        Bitmap.drawRepeatImage = function (renderContext, data, destWidth, destHeight, repeat) {
            var texture = data._texture_to_render;
            if (!texture) {
                return;
            }
            var textureWidth = texture._textureWidth;
            var textureHeight = texture._textureHeight;
            var sourceX = texture._bitmapX;
            var sourceY = texture._bitmapY;
            var sourceWidth = texture._bitmapWidth || textureWidth;
            var sourceHeight = texture._bitmapHeight || textureHeight;
            var destX = texture._offsetX;
            var destY = texture._offsetY;
            var renderFilter = egret.RenderFilter.getInstance();
            renderFilter.drawImage(renderContext, data, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight, repeat);
        };
        /**
         * 绘制九宫格位图
         */
        Bitmap.drawScale9GridImage = function (renderContext, data, scale9Grid, destWidth, destHeight) {
            var texture = data._texture_to_render;
            if (!texture || !scale9Grid) {
                return;
            }
            var renderFilter = egret.RenderFilter.getInstance();
            var textureWidth = texture._textureWidth;
            var textureHeight = texture._textureHeight;
            var sourceX = texture._bitmapX;
            var sourceY = texture._bitmapY;
            var sourceWidth = texture._bitmapWidth || textureWidth;
            var sourceHeight = texture._bitmapHeight || textureHeight;
            var destX = texture._offsetX;
            var destY = texture._offsetY;
            var s9g = egret.Rectangle.identity.initialize(scale9Grid.x - Math.round(destX), scale9Grid.y - Math.round(destX), scale9Grid.width, scale9Grid.height);
            var roundedDrawX = Math.round(destX);
            var roundedDrawY = Math.round(destY);
            destWidth -= textureWidth - sourceWidth;
            destHeight -= textureHeight - sourceHeight;
            //防止空心的情况出现。
            if (s9g.y == s9g.bottom) {
                if (s9g.bottom < sourceHeight)
                    s9g.bottom++;
                else
                    s9g.y--;
            }
            if (s9g.x == s9g.right) {
                if (s9g.right < sourceWidth)
                    s9g.right++;
                else
                    s9g.x--;
            }
            var sourceX2 = sourceX + s9g.x;
            var sourceX3 = sourceX + s9g.right;
            var sourceRightW = sourceWidth - s9g.right;
            var sourceY2 = sourceY + s9g.y;
            var sourceY3 = sourceY + s9g.bottom;
            var sourceBottomH = sourceHeight - s9g.bottom;
            var destX1 = roundedDrawX + s9g.x;
            var destY1 = roundedDrawY + s9g.y;
            var destScaleGridBottom = destHeight - (sourceHeight - s9g.bottom);
            var destScaleGridRight = destWidth - (sourceWidth - s9g.right);
            renderFilter.drawImage(renderContext, data, sourceX, sourceY, s9g.x, s9g.y, roundedDrawX, roundedDrawY, s9g.x, s9g.y);
            renderFilter.drawImage(renderContext, data, sourceX2, sourceY, s9g.width, s9g.y, destX1, roundedDrawY, destScaleGridRight - s9g.x, s9g.y);
            renderFilter.drawImage(renderContext, data, sourceX3, sourceY, sourceRightW, s9g.y, roundedDrawX + destScaleGridRight, roundedDrawY, destWidth - destScaleGridRight, s9g.y);
            renderFilter.drawImage(renderContext, data, sourceX, sourceY2, s9g.x, s9g.height, roundedDrawX, destY1, s9g.x, destScaleGridBottom - s9g.y);
            renderFilter.drawImage(renderContext, data, sourceX2, sourceY2, s9g.width, s9g.height, destX1, destY1, destScaleGridRight - s9g.x, destScaleGridBottom - s9g.y);
            renderFilter.drawImage(renderContext, data, sourceX3, sourceY2, sourceRightW, s9g.height, roundedDrawX + destScaleGridRight, destY1, destWidth - destScaleGridRight, destScaleGridBottom - s9g.y);
            renderFilter.drawImage(renderContext, data, sourceX, sourceY3, s9g.x, sourceBottomH, roundedDrawX, roundedDrawY + destScaleGridBottom, s9g.x, destHeight - destScaleGridBottom);
            renderFilter.drawImage(renderContext, data, sourceX2, sourceY3, s9g.width, sourceBottomH, destX1, roundedDrawY + destScaleGridBottom, destScaleGridRight - s9g.x, destHeight - destScaleGridBottom);
            renderFilter.drawImage(renderContext, data, sourceX3, sourceY3, sourceRightW, sourceBottomH, roundedDrawX + destScaleGridRight, roundedDrawY + destScaleGridBottom, destWidth - destScaleGridRight, destHeight - destScaleGridBottom);
        };
        /**
         * @see egret.DisplayObject.measureBounds
         * @returns {egret.Rectangle}
         * @private
         */
        Bitmap.prototype._measureBounds = function () {
            var texture = this._texture;
            if (!texture) {
                return _super.prototype._measureBounds.call(this);
            }
            var x = texture._offsetX;
            var y = texture._offsetY;
            var w = texture._textureWidth;
            var h = texture._textureHeight;
            return egret.Rectangle.identity.initialize(x, y, w, h);
        };
        /**
         * 全部Bitmap是否开启DEBUG模式
         * @member {boolean} egret.Bitmap.debug
         */
        Bitmap.debug = false;
        Bitmap.renderFilter = egret.RenderFilter.getInstance();
        return Bitmap;
    })(egret.DisplayObject);
    egret.Bitmap = Bitmap;
    Bitmap.prototype.__class__ = "egret.Bitmap";
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var egret;
(function (egret) {
    /**
     * @classdesc
     * @class egret.BitmapText
     * 位图字体采用了Bitmap+SpriteSheet的方式来渲染文字。
     * @extends egret.DisplayObjectContainer
     */
    var BitmapText = (function (_super) {
        __extends(BitmapText, _super);
        function BitmapText() {
            _super.call(this);
            /**
             * 设置文本
             */
            this._text = "";
            this._textChanged = false;
            this._bitmapPool = [];
        }
        Object.defineProperty(BitmapText.prototype, "text", {
            /**
             * 显示的文本内容
             * @member {string} egret.BitmapText#text
             *
             */
            get: function () {
                return this._text;
            },
            //        private current_rendered_text:string;
            set: function (value) {
                this._textChanged = true;
                this._text = value;
                this._setSizeDirty();
            },
            enumerable: true,
            configurable: true
        });
        BitmapText.prototype._updateTransform = function () {
            if (!this.visible) {
                return;
            }
            if (this._textChanged) {
                this._renderText();
            }
            _super.prototype._updateTransform.call(this);
        };
        //todo:这里对bounds的处理和TextField非常类似，以后考虑重构
        BitmapText.prototype._renderText = function (forMeasureContentSize) {
            if (forMeasureContentSize === void 0) { forMeasureContentSize = false; }
            var tempW = 0;
            var tempH = 0;
            if (this._textChanged) {
                this.removeChildren();
            }
            for (var i = 0, l = this.text.length; i < l; i++) {
                var character = this.text.charAt(i);
                var texture = this.spriteSheet.getTexture(character);
                if (texture == null) {
                    console.log("当前没有位图文字：" + character);
                    continue;
                }
                var offsetX = texture._offsetX;
                var offsetY = texture._offsetY;
                var characterWidth = texture._textureWidth;
                if (this._textChanged) {
                    var bitmap = this._bitmapPool[i];
                    if (!bitmap) {
                        bitmap = new egret.Bitmap();
                        this._bitmapPool.push(bitmap);
                    }
                    bitmap.texture = texture;
                    this.addChild(bitmap);
                    bitmap.x = tempW;
                }
                tempW += characterWidth + offsetX;
                if (offsetY + texture._textureHeight > tempH) {
                    tempH = offsetY + texture._textureHeight;
                }
            }
            this._textChanged = false;
            var rect = egret.Rectangle.identity.initialize(0, 0, tempW, tempH);
            return rect;
        };
        BitmapText.prototype._measureBounds = function () {
            return this._renderText(true);
        };
        return BitmapText;
    })(egret.DisplayObjectContainer);
    egret.BitmapText = BitmapText;
    BitmapText.prototype.__class__ = "egret.BitmapText";
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var egret;
(function (egret) {
    /**
     * @class egret.Graphics
     * @classdesc
     * Graphics 类包含一组可用来创建矢量形状的方法。支持绘制的显示对象包括 Sprite 和 Shape 对象。这些类中的每一个类都包括 graphics 属性，该属性是一个 Graphics 对象。
     * 以下是为便于使用而提供的一些辅助函数：drawRect()、drawRoundRect()、drawCircle() 和 drawEllipse()。
     */
    var Graphics = (function () {
        function Graphics() {
            this._minX = 0;
            this._minY = 0;
            this._maxX = 0;
            this._maxY = 0;
            this._lastX = 0;
            this._lastY = 0;
            this.commandQueue = [];
        }
        /**
         * 指定一种简单的单一颜色填充，在绘制时该填充将在随后对其他 Graphics 方法（如 lineTo() 或 drawCircle()）的调用中使用。
         * 调用 clear() 方法会清除填充。
         * @method egret.Graphics#beginFill
         * @param color {number} 填充的颜色
         * @param alpha {number} 填充的 Alpha 值
         */
        Graphics.prototype.beginFill = function (color, alpha) {
            if (alpha === void 0) { alpha = 1; }
        };
        Graphics.prototype._setStyle = function (colorStr) {
        };
        /**
         * 绘制一个矩形
         * @method egret.Graphics#drawRect
         * @param x {number} 圆心相对于父显示对象注册点的 x 位置（以像素为单位）。
         * @param y {number} 相对于父显示对象注册点的圆心的 y 位置（以像素为单位）。
         * @param width {number} 矩形的宽度（以像素为单位）。
         * @param height {number} 矩形的高度（以像素为单位）。
         * @param r? {number} 圆的半径（以像素为单位）,不设置就为直角矩形。
         */
        Graphics.prototype.drawRect = function (x, y, width, height) {
            this.checkRect(x, y, width, height);
        };
        /**
         * 绘制一个圆。
         * @method egret.Graphics#drawCircle
         * @param x {number} 圆心相对于父显示对象注册点的 x 位置（以像素为单位）。
         * @param y {number} 相对于父显示对象注册点的圆心的 y 位置（以像素为单位）。
         * @param r {number} 圆的半径（以像素为单位）。
         */
        Graphics.prototype.drawCircle = function (x, y, r) {
            this.checkRect(x - r, y - r, 2 * r, 2 * r);
        };
        /**
         * 绘制一个圆角矩形
         * @method egret.Graphics#drawRect
         * @param x {number} 圆心相对于父显示对象注册点的 x 位置（以像素为单位）。
         * @param y {number} 相对于父显示对象注册点的圆心的 y 位置（以像素为单位）。
         * @param width {number} 矩形的宽度（以像素为单位）。
         * @param height {number} 矩形的高度（以像素为单位）。
         * @param ellipseWidth {number} 用于绘制圆角的椭圆的宽度（以像素为单位）。
         * @param ellipseHeight {number} 用于绘制圆角的椭圆的高度（以像素为单位）。 （可选）如果未指定值，则默认值与为 ellipseWidth 参数提供的值相匹配。
         */
        Graphics.prototype.drawRoundRect = function (x, y, width, height, ellipseWidth, ellipseHeight) {
            this.checkRect(x, y, width, height);
        };
        /**
         * 绘制一个椭圆。
         * @method egret.Graphics#drawEllipse
         * @param x {number} 一个表示相对于父显示对象注册点的水平位置的数字（以像素为单位）。
         * @param y {number} 一个表示相对于父显示对象注册点的垂直位置的数字（以像素为单位）。
         * @param width {number} 矩形的宽度（以像素为单位）。
         * @param height {number} 矩形的高度（以像素为单位）。
         */
        Graphics.prototype.drawEllipse = function (x, y, width, height) {
            this.checkRect(x - width, y - height, 2 * width, 2 * height);
        };
        /**
         * 指定一种线条样式以用于随后对 lineTo() 或 drawCircle() 等 Graphics 方法的调用。
         * @method egret.Graphics#lineStyle
         * @param thickness {number} 一个整数，以点为单位表示线条的粗细，有效值为 0 到 255。如果未指定数字，或者未定义该参数，则不绘制线条。如果传递的值小于 0，则默认值为 0。值 0 表示极细的粗细；最大粗细为 255。如果传递的值大于 255，则默认值为 255。
         * @param color {number} 线条的十六进制颜色值（例如，红色为 0xFF0000，蓝色为 0x0000FF 等）。如果未指明值，则默认值为 0x000000（黑色）。可选。
         * @param alpha {number} 表示线条颜色的 Alpha 值的数字；有效值为 0 到 1。如果未指明值，则默认值为 1（纯色）。如果值小于 0，则默认值为 0。如果值大于 1，则默认值为 1。
         * @param pixelHinting {boolean} 布尔型值，指定是否提示笔触采用完整像素。它同时影响曲线锚点的位置以及线条笔触大小本身。在 pixelHinting 设置为 true 的情况下，线条宽度会调整到完整像素宽度。在 pixelHinting 设置为 false 的情况下，对于曲线和直线可能会出现脱节。
         * @param scaleMode {string} 用于指定要使用的比例模式
         * @param caps {string} 用于指定线条末端处端点类型的 CapsStyle 类的值。
         * @param joints {string} 指定用于拐角的连接外观的类型。
         * @param miterLimit {number} 用于表示剪切斜接的极限值的数字。
         */
        Graphics.prototype.lineStyle = function (thickness, color, alpha, pixelHinting, scaleMode, caps, joints, miterLimit) {
            if (thickness === void 0) { thickness = NaN; }
            if (color === void 0) { color = 0; }
            if (alpha === void 0) { alpha = 1.0; }
            if (pixelHinting === void 0) { pixelHinting = false; }
            if (scaleMode === void 0) { scaleMode = "normal"; }
            if (caps === void 0) { caps = null; }
            if (joints === void 0) { joints = null; }
            if (miterLimit === void 0) { miterLimit = 3; }
        };
        /**
         * 使用当前线条样式绘制一条从当前绘图位置开始到 (x, y) 结束的直线；当前绘图位置随后会设置为 (x, y)。
         * @method egret.Graphics#lineTo
         * @param x {number} 一个表示相对于父显示对象注册点的水平位置的数字（以像素为单位）。
         * @param y {number} 一个表示相对于父显示对象注册点的垂直位置的数字（以像素为单位）。
         */
        Graphics.prototype.lineTo = function (x, y) {
            this.checkPoint(x, y);
        };
        /**
         * 使用当前线条样式和由 (controlX, controlY) 指定的控制点绘制一条从当前绘图位置开始到 (anchorX, anchorY) 结束的二次贝塞尔曲线。当前绘图位置随后设置为 (anchorX, anchorY)。
         * 如果在调用 moveTo() 方法之前调用了 curveTo() 方法，则当前绘图位置的默认值为 (0, 0)。如果缺少任何一个参数，则此方法将失败，并且当前绘图位置不改变。
         * 绘制的曲线是二次贝塞尔曲线。二次贝塞尔曲线包含两个锚点和一个控制点。该曲线内插这两个锚点，并向控制点弯曲。
         * @method egret.Graphics#curveTo
         * @param controlX {number} 一个数字，指定控制点相对于父显示对象注册点的水平位置。
         * @param controlY {number} 一个数字，指定控制点相对于父显示对象注册点的垂直位置。
         * @param anchorX {number} 一个数字，指定下一个锚点相对于父显示对象注册点的水平位置。
         * @param anchorY {number} 一个数字，指定下一个锚点相对于父显示对象注册点的垂直位置。
         */
        Graphics.prototype.curveTo = function (controlX, controlY, anchorX, anchorY) {
            this.checkPoint(controlX, controlY);
            this.checkPoint(anchorX, anchorY);
        };
        /**
         * 将当前绘图位置移动到 (x, y)。如果缺少任何一个参数，则此方法将失败，并且当前绘图位置不改变。
         * @method egret.Graphics#moveTo
         * @param x {number} 一个表示相对于父显示对象注册点的水平位置的数字（以像素为单位）。
         * @param y {number} 一个表示相对于父显示对象注册点的垂直位置的数字（以像素为单位）。
         */
        Graphics.prototype.moveTo = function (x, y) {
            this.checkPoint(x, y);
        };
        /**
         * 清除绘制到此 Graphics 对象的图形，并重置填充和线条样式设置。
         * @method egret.Graphics#clear
         */
        Graphics.prototype.clear = function () {
            this._minX = 0;
            this._minY = 0;
            this._maxX = 0;
            this._maxY = 0;
        };
        /**
         * 对从上一次调用 beginFill()方法之后添加的直线和曲线应用填充。
         * @method egret.Graphics#endFill
         */
        Graphics.prototype.endFill = function () {
        };
        Graphics.prototype._draw = function (renderContext) {
        };
        Graphics.prototype.checkRect = function (x, y, w, h) {
            this._minX = Math.min(this._minX, x);
            this._minY = Math.min(this._minY, y);
            this._maxX = Math.max(this._maxX, x + w);
            this._maxY = Math.max(this._maxY, y + h);
        };
        Graphics.prototype.checkPoint = function (x, y) {
            this._minX = Math.min(this._minX, x);
            this._minY = Math.min(this._minY, y);
            this._maxX = Math.max(this._maxX, x);
            this._maxY = Math.max(this._maxY, y);
            this._lastX = x;
            this._lastY = y;
        };
        return Graphics;
    })();
    egret.Graphics = Graphics;
    Graphics.prototype.__class__ = "egret.Graphics";
    var Command = (function () {
        function Command(method, thisObject, args) {
            this.method = method;
            this.thisObject = thisObject;
            this.args = args;
        }
        return Command;
    })();
    Command.prototype.__class__ = "Command";
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var egret;
(function (egret) {
    /**
     * @class egret.Shape
     * @classdesc 此类用于使用 Egret 绘图应用程序编程接口 (API) 创建简单形状。Shape 类包括 graphics 属性，该属性使您可以从 Graphics 类访问方法。
     */
    var Shape = (function (_super) {
        __extends(Shape, _super);
        function Shape() {
            _super.call(this);
        }
        Object.defineProperty(Shape.prototype, "graphics", {
            get: function () {
                if (!this._graphics) {
                    var rendererContext = egret.MainContext.instance.rendererContext;
                    this._graphics = new egret.Graphics();
                }
                return this._graphics;
            },
            enumerable: true,
            configurable: true
        });
        Shape.prototype._render = function (renderContext) {
            if (this._graphics)
                this._graphics._draw(renderContext);
        };
        return Shape;
    })(egret.DisplayObject);
    egret.Shape = Shape;
    Shape.prototype.__class__ = "egret.Shape";
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var egret;
(function (egret) {
    /**
     * @class egret.Sprite
     * @classdesc Sprite 类是基本显示列表构造块：一个可显示图形并且也可包含子项的显示列表节点。Sprite 对象与影片剪辑类似，但没有时间轴。Sprite 是不需要时间轴的对象的相应基类。例如，Sprite 将是通常不使用时间轴的用户界面 (UI) 组件的逻辑基类。
     */
    var Sprite = (function (_super) {
        __extends(Sprite, _super);
        function Sprite() {
            _super.call(this);
        }
        Object.defineProperty(Sprite.prototype, "graphics", {
            get: function () {
                if (!this._graphics) {
                    this._graphics = new egret.Graphics();
                }
                return this._graphics;
            },
            enumerable: true,
            configurable: true
        });
        Sprite.prototype._render = function (renderContext) {
            if (this._graphics)
                this._graphics._draw(renderContext);
            _super.prototype._render.call(this, renderContext);
        };
        return Sprite;
    })(egret.DisplayObjectContainer);
    egret.Sprite = Sprite;
    Sprite.prototype.__class__ = "egret.Sprite";
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var egret;
(function (egret) {
    /**
     * @class egret.TextField
     * @classdesc
     * TextField是egret的文本渲染类，采用浏览器/设备的API进行渲染，在不同的浏览器/设备中由于字体渲染方式不一，可能会有渲染差异
     * 如果开发者希望所有平台完全无差异，请使用BitmapText
     * @extends egret.DisplayObject
     */
    var TextField = (function (_super) {
        __extends(TextField, _super);
        function TextField() {
            _super.call(this);
            this._inputEnabled = false;
            /**
             * 文本字段的类型。
             * 以下 TextFieldType 常量中的任一个：TextFieldType.DYNAMIC（指定用户无法编辑的动态文本字段），或 TextFieldType.INPUT（指定用户可以编辑的输入文本字段）。
             * 默认值为 dynamic。
             * @member {string} egret.TextField#type
             */
            this._type = "";
            /**
             * 作为文本字段中当前文本的字符串
             * @member {string} egret.TextField#text
             */
            this._text = "";
            /**
             * 指定文本字段是否是密码文本字段。
             * 如果此属性的值为 true，则文本字段被视为密码文本字段，并使用星号而不是实际字符来隐藏输入的字符。如果为 false，则不会将文本字段视为密码文本字段。
             * 默认值为 false。
             * @member {boolean} egret.TextInput#displayAsPassword
             */
            this._displayAsPassword = false;
            /**
             * 使用此文本格式的文本的字体名称，以字符串形式表示。
             * 默认值 Arial。
             * @member {any} egret.TextField#fontFamily
             */
            this._fontFamily = TextField.default_fontFamily;
            /**
             * 使用此文本格式的文本的大小（以像素为单位）。
             * 默认值为 30。
             * @member {number} egret.TextField#size
             */
            this._size = 30;
            this._textColorString = "#FFFFFF";
            /**
             * 表示文本的颜色。
             * 包含三个 8 位 RGB 颜色成分的数字；例如，0xFF0000 为红色，0x00FF00 为绿色。
             * 默认值为 0xFFFFFF。
             * @member {number} egret.TextField#textColor
             */
            this._textColor = 0xFFFFFF;
            this._strokeColorString = "#000000";
            /**
             * 表示文本的描边颜色。
             * 包含三个 8 位 RGB 颜色成分的数字；例如，0xFF0000 为红色，0x00FF00 为绿色。
             * 默认值为 0x000000。
             * @member {number} egret.TextField#strokeColor
             */
            this._strokeColor = 0x000000;
            /**
             * 表示描边宽度。
             * 0为没有描边。
             * 默认值为 0。
             * @member {number} egret.TextField#stroke
             */
            this._stroke = 0;
            /**
             * 文本水平对齐方式
             * 使用HorizontalAlign定义的常量。
             * 默认值为 HorizontalAlign.LEFT。
             * @member {string} egret.TextField#textAlign
             */
            this._textAlign = "left";
            /**
             * 文本垂直对齐方式。
             * 使用VerticalAlign定义的常量。
             * 默认值为 VerticalAlign.TOP。
             * @member {string} egret.TextField#verticalAlign
             */
            this._verticalAlign = "top";
            /**
             * 文本字段中最多可包含的字符数（即用户输入的字符数）。
             * 脚本可以插入比 maxChars 允许的字符数更多的文本；maxChars 属性仅表示用户可以输入多少文本。如果此属性的值为 0，则用户可以输入无限数量的文本。
             * 默认值为 0。
             * @type {number}
             * @private
             */
            this._maxChars = 0;
            /**
             * 行间距
             * 一个整数，表示行与行之间的垂直间距量。
             * 默认值为 0。
             * @member {number} egret.TextField#lineSpacing
             */
            this._lineSpacing = 0;
            /**
             * 文本行数。【只读】
             * @member {number} egret.TextField#numLines
             */
            this._numLines = 0;
            /**
             * 表示字段是否为多行文本字段。注意，此属性仅在type为TextFieldType.INPUT时才有效。
             * 如果值为 true，则文本字段为多行文本字段；如果值为 false，则文本字段为单行文本字段。在类型为 TextFieldType.INPUT 的字段中，multiline 值将确定 Enter 键是否创建新行（如果值为 false，则将忽略 Enter 键）。
             * 默认值为 false。
             * @member {boolean} egret.TextField#multiline
             */
            this._multiline = false;
            this._textArr = [];
            this._isArrayChanged = false;
            this._linesArr = [];
        }
        TextField.prototype.isInput = function () {
            return this._type == egret.TextFieldType.INPUT;
        };
        TextField.prototype._setTouchEnabled = function (value) {
            _super.prototype._setTouchEnabled.call(this, value);
            if (this.isInput()) {
                this._inputEnabled = true;
            }
        };
        Object.defineProperty(TextField.prototype, "type", {
            get: function () {
                return this._type;
            },
            set: function (value) {
                this._setType(value);
            },
            enumerable: true,
            configurable: true
        });
        TextField.prototype._setType = function (value) {
            if (this._type != value) {
                this._type = value;
                if (this._type == egret.TextFieldType.INPUT) {
                    if (!this._hasWidthSet) {
                        this._setWidth(100);
                    }
                    if (!this._hasHeightSet) {
                        this._setHeight(30);
                    }
                    //创建stageText
                    if (this._inputUtils == null) {
                        this._inputUtils = new egret.InputController();
                    }
                    this._inputUtils.init(this);
                    this._setDirty();
                    if (this._stage) {
                        this._inputUtils._addStageText();
                    }
                }
                else {
                    if (this._inputUtils) {
                        this._inputUtils._removeStageText();
                        this._inputUtils = null;
                    }
                }
            }
        };
        Object.defineProperty(TextField.prototype, "text", {
            get: function () {
                return this._getText();
            },
            set: function (value) {
                this._setText(value);
            },
            enumerable: true,
            configurable: true
        });
        TextField.prototype._getText = function () {
            if (this._type == egret.TextFieldType.INPUT) {
                return this._inputUtils._getText();
            }
            return this._text;
        };
        TextField.prototype._setTextDirty = function () {
            this._setSizeDirty();
        };
        TextField.prototype._setBaseText = function (value) {
            if (value == null) {
                value = "";
            }
            if (this._text != value || this._displayAsPassword) {
                this._setTextDirty();
                this._text = value;
                var text = "";
                if (this._displayAsPassword) {
                    for (var i = 0, num = this._text.length; i < num; i++) {
                        switch (this._text.charAt(i)) {
                            case '\n':
                                text += "\n";
                                break;
                            case '\r':
                                break;
                            default:
                                text += '*';
                        }
                    }
                }
                else {
                    text = this._text;
                }
                this.setMiddleStyle([[text]]);
            }
        };
        TextField.prototype._setText = function (value) {
            if (value == null) {
                value = "";
            }
            this._setBaseText(value);
            if (this._inputUtils) {
                this._inputUtils._setText(this._text);
            }
        };
        Object.defineProperty(TextField.prototype, "displayAsPassword", {
            get: function () {
                return this._displayAsPassword;
            },
            set: function (value) {
                this._setDisplayAsPassword(value);
            },
            enumerable: true,
            configurable: true
        });
        TextField.prototype._setDisplayAsPassword = function (value) {
            if (this._displayAsPassword != value) {
                this._displayAsPassword = value;
                this._setText(this._text);
            }
        };
        Object.defineProperty(TextField.prototype, "fontFamily", {
            get: function () {
                return this._fontFamily;
            },
            set: function (value) {
                this._setFontFamily(value);
            },
            enumerable: true,
            configurable: true
        });
        TextField.prototype._setFontFamily = function (value) {
            if (this._fontFamily != value) {
                this._setTextDirty();
                this._fontFamily = value;
            }
        };
        Object.defineProperty(TextField.prototype, "size", {
            get: function () {
                return this._size;
            },
            set: function (value) {
                this._setSize(value);
            },
            enumerable: true,
            configurable: true
        });
        TextField.prototype._setSize = function (value) {
            if (this._size != value) {
                this._setTextDirty();
                this._size = value;
            }
        };
        Object.defineProperty(TextField.prototype, "italic", {
            get: function () {
                return this._italic;
            },
            set: function (value) {
                this._setItalic(value);
            },
            enumerable: true,
            configurable: true
        });
        TextField.prototype._setItalic = function (value) {
            if (this._italic != value) {
                this._setTextDirty();
                this._italic = value;
            }
        };
        Object.defineProperty(TextField.prototype, "bold", {
            get: function () {
                return this._bold;
            },
            set: function (value) {
                this._setBold(value);
            },
            enumerable: true,
            configurable: true
        });
        TextField.prototype._setBold = function (value) {
            if (this._bold != value) {
                this._setTextDirty();
                this._bold = value;
            }
        };
        Object.defineProperty(TextField.prototype, "textColor", {
            get: function () {
                return this._textColor;
            },
            set: function (value) {
                this._setTextColor(value);
            },
            enumerable: true,
            configurable: true
        });
        TextField.prototype._setTextColor = function (value) {
            if (this._textColor != value) {
                this._setTextDirty();
                this._textColor = value;
                this._textColorString = egret.toColorString(value);
            }
        };
        Object.defineProperty(TextField.prototype, "strokeColor", {
            get: function () {
                return this._strokeColor;
            },
            set: function (value) {
                this._setStrokeColor(value);
            },
            enumerable: true,
            configurable: true
        });
        TextField.prototype._setStrokeColor = function (value) {
            if (this._strokeColor != value) {
                this._setTextDirty();
                this._strokeColor = value;
                this._strokeColorString = egret.toColorString(value);
            }
        };
        Object.defineProperty(TextField.prototype, "stroke", {
            get: function () {
                return this._stroke;
            },
            set: function (value) {
                this._setStroke(value);
            },
            enumerable: true,
            configurable: true
        });
        TextField.prototype._setStroke = function (value) {
            if (this._stroke != value) {
                this._setTextDirty();
                this._stroke = value;
            }
        };
        Object.defineProperty(TextField.prototype, "textAlign", {
            get: function () {
                return this._textAlign;
            },
            set: function (value) {
                this._setTextAlign(value);
            },
            enumerable: true,
            configurable: true
        });
        TextField.prototype._setTextAlign = function (value) {
            if (this._textAlign != value) {
                this._setTextDirty();
                this._textAlign = value;
            }
        };
        Object.defineProperty(TextField.prototype, "verticalAlign", {
            get: function () {
                return this._verticalAlign;
            },
            set: function (value) {
                this._setVerticalAlign(value);
            },
            enumerable: true,
            configurable: true
        });
        TextField.prototype._setVerticalAlign = function (value) {
            if (this._verticalAlign != value) {
                this._setTextDirty();
                this._verticalAlign = value;
            }
        };
        Object.defineProperty(TextField.prototype, "maxChars", {
            get: function () {
                return this._maxChars;
            },
            set: function (value) {
                this._setMaxChars(value);
            },
            enumerable: true,
            configurable: true
        });
        TextField.prototype._setMaxChars = function (value) {
            if (this._maxChars != value) {
                this._maxChars = value;
            }
        };
        Object.defineProperty(TextField.prototype, "maxScrollV", {
            get: function () {
                return this._numLines;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TextField.prototype, "selectionBeginIndex", {
            get: function () {
                return 0;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TextField.prototype, "selectionEndIndex", {
            get: function () {
                return 0;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TextField.prototype, "caretIndex", {
            get: function () {
                return 0;
            },
            enumerable: true,
            configurable: true
        });
        TextField.prototype._setSelection = function (beginIndex, endIndex) {
        };
        Object.defineProperty(TextField.prototype, "lineSpacing", {
            get: function () {
                return this._lineSpacing;
            },
            set: function (value) {
                this._setLineSpacing(value);
            },
            enumerable: true,
            configurable: true
        });
        TextField.prototype._setLineSpacing = function (value) {
            if (this._lineSpacing != value) {
                this._setTextDirty();
                this._lineSpacing = value;
            }
        };
        TextField.prototype._getLineHeight = function () {
            return this._lineSpacing + this._size;
        };
        Object.defineProperty(TextField.prototype, "numLines", {
            get: function () {
                return this._numLines;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TextField.prototype, "multiline", {
            get: function () {
                return this._multiline;
            },
            set: function (value) {
                this._setMultiline(value);
            },
            enumerable: true,
            configurable: true
        });
        TextField.prototype._setMultiline = function (value) {
            this._multiline = value;
            this._setDirty();
        };
        TextField.prototype.setFocus = function () {
            //todo:
            egret.Logger.warning("TextField.setFocus 没有实现");
        };
        TextField.prototype._onRemoveFromStage = function () {
            _super.prototype._onRemoveFromStage.call(this);
            if (this._type == egret.TextFieldType.INPUT) {
                this._inputUtils._removeStageText();
            }
        };
        TextField.prototype._onAddToStage = function () {
            _super.prototype._onAddToStage.call(this);
            if (this._type == egret.TextFieldType.INPUT) {
                this._inputUtils._addStageText();
            }
        };
        TextField.prototype._updateBaseTransform = function () {
            _super.prototype._updateTransform.call(this);
        };
        TextField.prototype._updateTransform = function () {
            if (this._type == egret.TextFieldType.INPUT) {
                if (this._normalDirty) {
                    this._clearDirty();
                    this._inputUtils._updateProperties();
                }
                else {
                    this._inputUtils._updateTransform();
                }
            }
            else {
                this._updateBaseTransform();
            }
        };
        /**
         * @see egret.DisplayObject._render
         * @param renderContext
         */
        TextField.prototype._render = function (renderContext) {
            this.drawText(renderContext, false);
            this._clearDirty();
        };
        /**
         * 测量显示对象坐标与大小
         */
        TextField.prototype._measureBounds = function () {
            var renderContext = egret.MainContext.instance.rendererContext;
            return this.drawText(renderContext, true);
        };
        /**
         *
         * @param textArr [["text1", {"color":0xffffff}], ["text2", {"color":0xff0000}]]
         * @private
         */
        TextField.prototype._setTextArray = function (textArr) {
            var text = "";
            for (var i = 0; i < textArr.length; i++) {
                text += textArr[i][0];
                textArr[i][0] = this.changeToPassText(textArr[i][0]);
            }
            this._text = text;
            this.setMiddleStyle(textArr);
            this._setSizeDirty();
        };
        TextField.prototype.changeToPassText = function (text) {
            if (this._displayAsPassword) {
                var passText = "";
                for (var i = 0, num = text.length; i < num; i++) {
                    switch (text.charAt(i)) {
                        case '\n':
                            passText += "\n";
                            break;
                        case '\r':
                            break;
                        default:
                            passText += '*';
                    }
                }
                return passText;
            }
            return text;
        };
        TextField.prototype.setMiddleStyle = function (textArr) {
            this._isArrayChanged = true;
            this._textArr = textArr;
        };
        TextField.prototype._getLinesArr = function () {
            if (!this._isArrayChanged) {
                return this._linesArr;
            }
            this._isArrayChanged = false;
            var text2Arr = this._textArr;
            var renderContext = egret.MainContext.instance.rendererContext;
            this._linesArr = [];
            var linesArr = this._linesArr;
            var lineW = 0;
            var lineH = 0;
            var lineCount = 0;
            for (var i = 0; i < text2Arr.length; i++) {
                var textInfo = text2Arr[i];
                textInfo[1] = textInfo[1] || {};
                lineH = Math.max(lineH, textInfo[1]["size"] || this._size);
                var text = textInfo[0].toString();
                var textArr = text.split(/(?:\r\n|\r|\n)/);
                for (var j = 0; j < textArr.length; j++) {
                    if (linesArr[lineCount] == null) {
                        linesArr[lineCount] = [];
                        lineW = 0;
                    }
                    renderContext.setupFont(this);
                    var w = renderContext.measureText(textArr[j]);
                    if (!this._hasWidthSet) {
                        lineW += w;
                        linesArr[lineCount].push([textArr[j], textInfo[1], w]);
                    }
                    else {
                        if (lineW + w < this._explicitWidth) {
                            linesArr[lineCount].push([textArr[j], textInfo[1], w]);
                            lineW += w;
                        }
                        else {
                            var k = 0;
                            var ww = 0;
                            var word = textArr[j];
                            for (; k < word.length; k++) {
                                w = renderContext.measureText(word.charAt(k));
                                if (lineW + w > this._explicitWidth) {
                                    break;
                                }
                                ww += w;
                                lineW += w;
                            }
                            if (k > 0) {
                                linesArr[lineCount].push([word.substring(0, k), textInfo[1], ww]);
                                textArr[j] = word.substring(k);
                            }
                            j--;
                        }
                    }
                    if (j < textArr.length - 1) {
                        linesArr[lineCount].push([lineW, lineH]);
                        if (this._type == egret.TextFieldType.INPUT && !this._multiline) {
                            return linesArr;
                        }
                        lineCount++;
                    }
                }
                if (i == text2Arr.length - 1) {
                    linesArr[lineCount].push([lineW, lineH]);
                }
            }
            return linesArr;
        };
        /**
         * @private
         * @param renderContext
         * @returns {Rectangle}
         */
        TextField.prototype.drawText = function (renderContext, forMeasure) {
            var lines = this._getLinesArr();
            renderContext.setupFont(this);
            if (!lines) {
                return egret.Rectangle.identity.initialize(0, 0, 0, 0);
            }
            var length = lines.length;
            var drawY = this._size * 0.5;
            var textHeight = 0;
            var maxWidth = 0;
            for (var i = 0; i < lines.length; i++) {
                var lineArr = lines[i];
                textHeight += lineArr[lineArr.length - 1][1];
                maxWidth = Math.max(lineArr[lineArr.length - 1][0], maxWidth);
            }
            textHeight += (length - 1) * this._lineSpacing;
            if (this._hasWidthSet) {
                maxWidth = this._explicitWidth;
            }
            var explicitHeight = this._hasHeightSet ? this._explicitHeight : Number.POSITIVE_INFINITY;
            if (this._hasHeightSet && textHeight < explicitHeight) {
                var valign = 0;
                if (this._verticalAlign == egret.VerticalAlign.MIDDLE)
                    valign = 0.5;
                else if (this._verticalAlign == egret.VerticalAlign.BOTTOM)
                    valign = 1;
                drawY += valign * (explicitHeight - textHeight);
            }
            drawY = Math.round(drawY);
            var halign = 0;
            if (this._textAlign == egret.HorizontalAlign.CENTER) {
                halign = 0.5;
            }
            else if (this._textAlign == egret.HorizontalAlign.RIGHT) {
                halign = 1;
            }
            var drawX = 0;
            for (var i = 0; i < length; i++) {
                var lineArr = lines[i];
                drawX = Math.round((maxWidth - lineArr[lineArr.length - 1][0]) * halign);
                for (var j = 0; j < lineArr.length - 1; j++) {
                    if (!forMeasure) {
                        if (this._type == egret.TextFieldType.INPUT) {
                            renderContext.drawText(this, lineArr[j][0], drawX, drawY, lineArr[j][2], {});
                        }
                        else {
                            renderContext.drawText(this, lineArr[j][0], drawX, drawY, lineArr[j][2], lineArr[j][1]);
                        }
                    }
                    drawX += lineArr[j][2];
                }
                drawY += lineArr[lineArr.length - 1][1] + this._lineSpacing;
                if (this._hasHeightSet && drawY - this._size * 0.5 > this._explicitHeight) {
                    break;
                }
            }
            return egret.Rectangle.identity.initialize(0, 0, maxWidth, textHeight);
        };
        TextField.default_fontFamily = "Arial";
        return TextField;
    })(egret.DisplayObject);
    egret.TextField = TextField;
    TextField.prototype.__class__ = "egret.TextField";
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var egret;
(function (egret) {
    /**
     * @class egret.TextFieldType
     * @classdesc
     * TextFieldType 类是在设置 TextField 类的 type 属性时使用的常数值的枚举。
     */
    var TextFieldType = (function () {
        function TextFieldType() {
        }
        /**
         * 用于指定动态文本
         * @constant {string} egret.TextFieldType.DYNAMIC
         */
        TextFieldType.DYNAMIC = "dynamic";
        /**
         * 用于指定输入文本
         * @constant {string} egret.TextFieldType.INPUT
         */
        TextFieldType.INPUT = "input";
        return TextFieldType;
    })();
    egret.TextFieldType = TextFieldType;
    TextFieldType.prototype.__class__ = "egret.TextFieldType";
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var egret;
(function (egret) {
    /**
     * @class egret.SpriteSheet
     * @classdesc SpriteSheet是一张由多个子位图拼接而成的集合位图，它包含多个Texture对象。
     * 每一个Texture都共享SpriteSheet的集合位图，但是指向它的不同的区域。
     * 在WebGL / OpenGL上，这种做法可以显著提升性能
     * 同时，SpriteSheet可以很方便的进行素材整合，降低HTTP请求数量
     * SpriteSheet 格式的具体规范可以参见此文档  https://github.com/egret-labs/egret-core/wiki/Egret-SpriteSheet-Specification
     *
     */
    var SpriteSheet = (function (_super) {
        __extends(SpriteSheet, _super);
        function SpriteSheet(texture) {
            _super.call(this);
            var bitmapData = texture.bitmapData;
            this.bitmapData = bitmapData;
            this._textureMap = {};
            this._sourceWidth = bitmapData.width;
            this._sourceHeight = bitmapData.height;
            this._bitmapX = texture._bitmapX - texture._offsetX;
            this._bitmapY = texture._bitmapY - texture._offsetY;
        }
        /**
         * 根据指定纹理名称获取一个缓存的Texture对象
         * @method egret.SpriteSheet#getTexture
         * @param name {string} 缓存这个Texture对象所使用的名称
         * @returns {egret.Texture} Texture对象
         */
        SpriteSheet.prototype.getTexture = function (name) {
            return this._textureMap[name];
        };
        /**
         * 为SpriteSheet上的指定区域创建一个新的Texture对象并缓存它
         * @method egret.SpriteSheet#createTexture
         * @param name {string} 缓存这个Texture对象所使用的名称，如果名称已存在，将会覆盖之前的Texture对象
         * @param bitmapX {number} 纹理区域在bitmapData上的起始坐标x
         * @param bitmapY {number} 纹理区域在bitmapData上的起始坐标y
         * @param bitmapWidth {number} 纹理区域在bitmapData上的宽度
         * @param bitmapHeight {number} 纹理区域在bitmapData上的高度
         * @param offsetX {number} 原始位图的非透明区域x起始点
         * @param offsetY {number} 原始位图的非透明区域y起始点
         * @param textureWidth {number} 原始位图的高度，若不传入，则使用bitmapWidth的值。
         * @param textureHeight {number} 原始位图的宽度，若不传入，这使用bitmapHeight值。
         * @returns {egret.Texture} 创建的Texture对象
         */
        SpriteSheet.prototype.createTexture = function (name, bitmapX, bitmapY, bitmapWidth, bitmapHeight, offsetX, offsetY, textureWidth, textureHeight) {
            if (offsetX === void 0) { offsetX = 0; }
            if (offsetY === void 0) { offsetY = 0; }
            if (typeof textureWidth === "undefined") {
                textureWidth = offsetX + bitmapWidth;
            }
            if (typeof textureHeight === "undefined") {
                textureHeight = offsetY + bitmapHeight;
            }
            var texture = new egret.Texture();
            texture._bitmapData = this.bitmapData;
            texture._bitmapX = this._bitmapX + bitmapX;
            texture._bitmapY = this._bitmapY + bitmapY;
            texture._bitmapWidth = bitmapWidth;
            texture._bitmapHeight = bitmapHeight;
            texture._offsetX = offsetX;
            texture._offsetY = offsetY;
            texture._textureWidth = textureWidth;
            texture._textureHeight = textureHeight;
            texture._sourceWidth = this._sourceWidth;
            texture._sourceHeight = this._sourceHeight;
            this._textureMap[name] = texture;
            return texture;
        };
        return SpriteSheet;
    })(egret.HashObject);
    egret.SpriteSheet = SpriteSheet;
    SpriteSheet.prototype.__class__ = "egret.SpriteSheet";
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var egret;
(function (egret) {
    /**
     * @class egret.TextInput
     * @classdesc
     * TextInput 已废弃，请使用TextField代替，并设置type为TextFieldType.INPUT
     * @extends egret.TextField
     * @deprecated
     */
    var TextInput = (function (_super) {
        __extends(TextInput, _super);
        function TextInput() {
            _super.call(this);
            egret.Logger.warning("TextInput 已废弃，请使用TextField代替，并设置type为TextFieldType.INPUT");
            this.type = egret.TextFieldType.INPUT;
        }
        /**
         * 请使用TextField.text设置
         * @deprecated
         * @param value
         */
        TextInput.prototype.setText = function (value) {
            egret.Logger.warning("TextField.setText()已废弃，请使用TextInput.text设置");
            this.text = value;
        };
        /**
         * 请使用TextInput.text获取
         * @deprecated
         * @returns {string}
         */
        TextInput.prototype.getText = function () {
            egret.Logger.warning("TextField.getText()已废弃，请使用TextInput.text获取");
            return this.text;
        };
        /**
         * 请使用TextInput.displayAsPassword设置
         * @deprecated
         * @param value
         */
        TextInput.prototype.setTextType = function (type) {
            egret.Logger.warning("TextField.setTextType()已废弃，请使用TextInput.displayAsPassword设置");
            this.displayAsPassword = type == "password";
        };
        /**
         * 请使用TextInput.displayAsPassword获取
         * @deprecated
         * @returns {string}
         */
        TextInput.prototype.getTextType = function () {
            egret.Logger.warning("TextField.getTextType()已废弃，请使用TextInput.displayAsPassword获取");
            return this.displayAsPassword ? "password" : "text";
        };
        return TextInput;
    })(egret.TextField);
    egret.TextInput = TextInput;
    TextInput.prototype.__class__ = "egret.TextInput";
})(egret || (egret = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var egret;
(function (egret) {
    var InputController = (function (_super) {
        __extends(InputController, _super);
        function InputController() {
            _super.call(this);
            this._isFocus = false;
            this._isFirst = true;
            this._isFirst = true;
        }
        InputController.prototype.init = function (text) {
            this._text = text;
            this.stageText = egret.StageText.create();
            var point = this._text.localToGlobal();
            this.stageText._open(point.x, point.y, this._text._explicitWidth, this._text._explicitHeight);
        };
        InputController.prototype._addStageText = function () {
            if (!this._text._inputEnabled) {
                this._text._touchEnabled = true;
            }
            this.stageText._add();
            this.stageText._addListeners();
            this.stageText.addEventListener("blur", this.onBlurHandler, this);
            this.stageText.addEventListener("focus", this.onFocusHandler, this);
            this.stageText.addEventListener("updateText", this.updateTextHandler, this);
            this._text.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onMouseDownHandler, this);
            egret.MainContext.instance.stage.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onStageDownHandler, this);
        };
        InputController.prototype._removeStageText = function () {
            this.stageText._remove();
            this.stageText._removeListeners();
            if (!this._text._inputEnabled) {
                this._text._touchEnabled = false;
            }
            this.stageText.removeEventListener("blur", this.onBlurHandler, this);
            this.stageText.removeEventListener("focus", this.onFocusHandler, this);
            this.stageText.removeEventListener("updateText", this.updateTextHandler, this);
            this._text.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onMouseDownHandler, this);
            egret.MainContext.instance.stage.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onStageDownHandler, this);
        };
        InputController.prototype._getText = function () {
            return this.stageText._getText();
        };
        InputController.prototype._setText = function (value) {
            this.stageText._setText(value);
        };
        InputController.prototype.onFocusHandler = function (event) {
            this.hideText();
        };
        //显示文本
        InputController.prototype.onBlurHandler = function (event) {
            this.showText();
        };
        //点中文本
        InputController.prototype.onMouseDownHandler = function (event) {
            event.stopPropagation();
            if (!this._text._visible) {
                return;
            }
            this.stageText._show();
        };
        //未点中文本
        InputController.prototype.onStageDownHandler = function (event) {
            this.stageText._hide();
            this.showText();
        };
        InputController.prototype.showText = function () {
            if (this._isFocus) {
                this._isFocus = false;
                this.resetText();
            }
        };
        InputController.prototype.hideText = function () {
            if (!this._isFocus) {
                this._text._setBaseText("");
                this._isFocus = true;
            }
        };
        InputController.prototype.updateTextHandler = function (event) {
            this.resetText();
            //抛出change事件
            this._text.dispatchEvent(new egret.Event(egret.Event.CHANGE));
        };
        InputController.prototype.resetText = function () {
            this._text._setBaseText(this.stageText._getText());
        };
        InputController.prototype._updateTransform = function () {
            //todo 等待worldTransform的性能优化完成，合并这块代码
            var oldTransFormA = this._text._worldTransform.a;
            var oldTransFormB = this._text._worldTransform.b;
            var oldTransFormC = this._text._worldTransform.c;
            var oldTransFormD = this._text._worldTransform.d;
            var oldTransFormTx = this._text._worldTransform.tx;
            var oldTransFormTy = this._text._worldTransform.ty;
            this._text._updateBaseTransform();
            var newTransForm = this._text._worldTransform;
            if (this._isFirst || oldTransFormA != newTransForm.a || oldTransFormB != newTransForm.b || oldTransFormC != newTransForm.c || oldTransFormD != newTransForm.d || oldTransFormTx != newTransForm.tx || oldTransFormTy != newTransForm.ty) {
                this._isFirst = false;
                var point = this._text.localToGlobal();
                this.stageText.changePosition(point.x, point.y);
                var self = this;
                egret.callLater(function () {
                    self.stageText._setScale(self._text._worldTransform.a, self._text._worldTransform.d);
                }, this);
            }
        };
        InputController.prototype._updateProperties = function () {
            var stage = this._text._stage;
            if (stage == null) {
                this.stageText._setVisible(false);
            }
            else {
                var item = this._text;
                var visible = item._visible;
                while (true) {
                    if (!visible) {
                        break;
                    }
                    item = item.parent;
                    if (item == stage) {
                        break;
                    }
                    visible = item._visible;
                }
                this.stageText._setVisible(visible);
            }
            this.stageText._setMultiline(this._text._multiline);
            this.stageText._setMaxChars(this._text._maxChars);
            this.stageText._setSize(this._text._size);
            this.stageText._setTextColor(this._text._textColorString);
            this.stageText._setTextFontFamily(this._text._fontFamily);
            this.stageText._setBold(this._text._bold);
            this.stageText._setItalic(this._text._italic);
            this.stageText._setTextAlign(this._text._textAlign);
            this.stageText._setWidth(this._text._getSize(egret.Rectangle.identity).width);
            this.stageText._setHeight(this._text._getSize(egret.Rectangle.identity).height);
            this.stageText._setTextType(this._text._displayAsPassword ? "password" : "text");
            this.stageText._setText(this._text._text);
            //整体修改
            this.stageText._resetStageText();
            this._updateTransform();
        };
        return InputController;
    })(egret.HashObject);
    egret.InputController = InputController;
    InputController.prototype.__class__ = "egret.InputController";
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var egret;
(function (egret) {
    var BitmapTextSpriteSheet = (function (_super) {
        __extends(BitmapTextSpriteSheet, _super);
        function BitmapTextSpriteSheet(texture, fntText) {
            _super.call(this, texture);
            this.charList = this.parseConfig(fntText);
        }
        BitmapTextSpriteSheet.prototype.getTexture = function (name) {
            var texture = this._textureMap[name];
            if (!texture) {
                var c = this.charList[name];
                if (!c) {
                    return null;
                }
                texture = this.createTexture(name, c.x, c.y, c.width, c.height, c.offsetX, c.offsetY);
                this._textureMap[name] = texture;
            }
            return texture;
        };
        BitmapTextSpriteSheet.prototype.parseConfig = function (fntText) {
            fntText = fntText.split("\r\n").join("\n");
            var lines = fntText.split("\n");
            var charsCount = this.getConfigByKey(lines[3], "count");
            var chars = {};
            for (var i = 4; i < 4 + charsCount; i++) {
                var charText = lines[i];
                var letter = String.fromCharCode(this.getConfigByKey(charText, "id"));
                var c = {};
                chars[letter] = c;
                c["x"] = this.getConfigByKey(charText, "x");
                c["y"] = this.getConfigByKey(charText, "y");
                c["width"] = this.getConfigByKey(charText, "width");
                c["height"] = this.getConfigByKey(charText, "height");
                c["offsetX"] = this.getConfigByKey(charText, "xoffset");
                c["offsetY"] = this.getConfigByKey(charText, "yoffset");
            }
            return chars;
        };
        BitmapTextSpriteSheet.prototype.getConfigByKey = function (configText, key) {
            var itemConfigTextList = configText.split(" ");
            for (var i = 0, length = itemConfigTextList.length; i < length; i++) {
                var itemConfigText = itemConfigTextList[i];
                if (key == itemConfigText.substring(0, key.length)) {
                    var value = itemConfigText.substring(key.length + 1);
                    return parseInt(value);
                }
            }
            return 0;
        };
        return BitmapTextSpriteSheet;
    })(egret.SpriteSheet);
    egret.BitmapTextSpriteSheet = BitmapTextSpriteSheet;
    BitmapTextSpriteSheet.prototype.__class__ = "egret.BitmapTextSpriteSheet";
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var egret;
(function (egret) {
    /**
     * @class egret.MovieClip
     * @classdesc 影片剪辑，可以通过影片剪辑播放序列帧动画。
     * @extends egret.DisplayObjectContainer
     */
    var MovieClip = (function (_super) {
        __extends(MovieClip, _super);
        function MovieClip(data, texture) {
            _super.call(this);
            /**
             * 动画的播放帧频
             * @member {number} egret.MovieClip#frameRate
             */
            this.frameRate = 60;
            if (data instanceof DefaultMovieClipDelegate) {
                egret.Logger.warning("MovieClip#constructor接口参数已经变更，请尽快调整用法为 new MovieClip(data,texture)");
                this.delegate = data;
            }
            else {
                this.delegate = new DefaultMovieClipDelegate(data, texture);
            }
            this.delegate.setMovieClip(this);
        }
        /**
         * 播放指定动画
         * @method egret.MovieClip#gotoAndPlay
         * @param frameName {string} 指定帧的帧名称

         */
        MovieClip.prototype.gotoAndPlay = function (frameName) {
            this.delegate.gotoAndPlay(frameName);
        };
        /**
         * 播放并暂停指定动画
         * @method egret.MovieClip#gotoAndStop
         * @param frameName {string} 指定帧的帧名称

         */
        MovieClip.prototype.gotoAndStop = function (frameName) {
            this.delegate.gotoAndStop(frameName);
        };
        /**
         * 暂停动画
         * @method egret.MovieClip#stop
         */
        MovieClip.prototype.stop = function () {
            this.delegate.stop();
        };
        /**
         * @method egret.MovieClip#dispose
         */
        MovieClip.prototype.dispose = function () {
            this.delegate.dispose();
        };
        /**
         * 方法名改为 dispose
         * @method egret.MovieClip#release
         * @deprecated
         */
        MovieClip.prototype.release = function () {
            egret.Logger.warning("MovieClip#release方法即将废弃");
            this.dispose();
        };
        /**
         * @method egret.MovieClip#getCurrentFrameIndex
         * @deprecated
         * @returns {number}
         */
        MovieClip.prototype.getCurrentFrameIndex = function () {
            egret.Logger.warning("MovieClip#getCurrentFrameIndex方法即将废弃");
            return this.delegate["_currentFrameIndex"];
        };
        /**
         * 获取当前影片剪辑的帧频数
         * @method egret.MovieClip#getTotalFrame
         * @deprecated
         * @returns {number}
         */
        MovieClip.prototype.getTotalFrame = function () {
            egret.Logger.warning("MovieClip#getTotalFrame方法即将废弃");
            return this.delegate["_totalFrame"];
        };
        /**
         * @method egret.MovieClip#setInterval
         * @deprecated
         * @param value {number}
         */
        MovieClip.prototype.setInterval = function (value) {
            egret.Logger.warning("MovieClip#setInterval方法即将废弃,请使用MovieClip#frameRate代替");
            this.frameRate = 60 / value;
        };
        /**
         * @method egret.MovieClip#getIsPlaying
         * @deprecated
         * @returns {boolean}
         */
        MovieClip.prototype.getIsPlaying = function () {
            egret.Logger.warning("MovieClip#getIsPlaying方法即将废弃");
            return this.delegate["isPlaying"];
        };
        return MovieClip;
    })(egret.DisplayObjectContainer);
    egret.MovieClip = MovieClip;
    MovieClip.prototype.__class__ = "egret.MovieClip";
    var DefaultMovieClipDelegate = (function () {
        function DefaultMovieClipDelegate(data, texture) {
            this.data = data;
            this._totalFrame = 0;
            this._passTime = 0;
            this._currentFrameIndex = 0;
            this._isPlaying = false;
            this._frameData = data;
            this._spriteSheet = new egret.SpriteSheet(texture);
        }
        DefaultMovieClipDelegate.prototype.setMovieClip = function (movieClip) {
            this.movieClip = movieClip;
            this.bitmap = new egret.Bitmap();
            this.movieClip.addChild(this.bitmap);
        };
        DefaultMovieClipDelegate.prototype.gotoAndPlay = function (frameName) {
            this.checkHasFrame(frameName);
            this._isPlaying = true;
            this._currentFrameIndex = 0;
            this._currentFrameName = frameName;
            this._totalFrame = this._frameData.frames[frameName].totalFrame;
            this.playNextFrame();
            this._passTime = 0;
            egret.Ticker.getInstance().register(this.update, this);
        };
        DefaultMovieClipDelegate.prototype.gotoAndStop = function (frameName) {
            this.checkHasFrame(frameName);
            this.stop();
            this._passTime = 0;
            this._currentFrameIndex = 0;
            this._currentFrameName = frameName;
            this._totalFrame = this._frameData.frames[frameName].totalFrame;
            this.playNextFrame();
        };
        DefaultMovieClipDelegate.prototype.stop = function () {
            this._isPlaying = false;
            egret.Ticker.getInstance().unregister(this.update, this);
        };
        DefaultMovieClipDelegate.prototype.dispose = function () {
        };
        DefaultMovieClipDelegate.prototype.checkHasFrame = function (name) {
            if (this._frameData.frames[name] == undefined) {
                egret.Logger.fatal("MovieClip没有对应的frame：", name);
            }
        };
        DefaultMovieClipDelegate.prototype.update = function (advancedTime) {
            var oneFrameTime = 1000 / this.movieClip.frameRate;
            var last = this._passTime % oneFrameTime;
            var num = Math.floor((last + advancedTime) / oneFrameTime);
            while (num >= 1) {
                if (num == 1) {
                    this.playNextFrame();
                }
                else {
                    this.playNextFrame(false);
                }
                num--;
            }
            this._passTime += advancedTime;
        };
        DefaultMovieClipDelegate.prototype.playNextFrame = function (needShow) {
            if (needShow === void 0) { needShow = true; }
            var frameData = this._frameData.frames[this._currentFrameName].childrenFrame[this._currentFrameIndex];
            if (needShow) {
                var texture = this.getTexture(frameData.res);
                var bitmap = this.bitmap;
                bitmap.x = frameData.x;
                bitmap.y = frameData.y;
                bitmap.texture = texture;
            }
            if (frameData.action != null) {
                this.movieClip.dispatchEventWith(frameData.action);
            }
            this._currentFrameIndex++;
            if (this._currentFrameIndex == this._totalFrame) {
                this._currentFrameIndex = 0;
                if (frameData.action != egret.Event.COMPLETE) {
                    this.movieClip.dispatchEventWith(egret.Event.COMPLETE);
                }
            }
        };
        DefaultMovieClipDelegate.prototype.getTexture = function (name) {
            var resData = this._frameData.res[name];
            var texture = this._spriteSheet.getTexture(name);
            if (!texture) {
                texture = this._spriteSheet.createTexture(name, resData.x, resData.y, resData.w, resData.h);
            }
            return texture;
        };
        return DefaultMovieClipDelegate;
    })();
    egret.DefaultMovieClipDelegate = DefaultMovieClipDelegate;
    DefaultMovieClipDelegate.prototype.__class__ = "egret.DefaultMovieClipDelegate";
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var egret;
(function (egret) {
    /**
     * @class egret.StageText
     * @classdesc
     * @extends egret.HashObject
     */
    var StageText = (function (_super) {
        __extends(StageText, _super);
        function StageText() {
            _super.call(this);
            this._scaleX = 1;
            this._scaleY = 1;
            this._size = 30;
            this._color = "#FFFFFF";
            this._fontFamily = "Arial";
            this._bold = false;
            this._italic = false;
            this._textAlign = "left";
            this._visible = false;
            this._multiline = false;
            this._maxChars = 0;
        }
        /**
         * @method egret.StageText#getText
         * @returns {string}
         */
        StageText.prototype._getText = function () {
            return null;
        };
        /**
         * @method egret.StageText#setText
         * @param value {string}
         */
        StageText.prototype._setText = function (value) {
        };
        /**
         * @method egret.StageText#setTextType
         * @param type {string}
         */
        StageText.prototype._setTextType = function (type) {
        };
        /**
         * @method egret.StageText#getTextType
         * @returns {string}
         */
        StageText.prototype._getTextType = function () {
            return null;
        };
        /**
         * @method egret.StageText#open
         * @param x {number}
         * @param y {number}
         * @param width {number}
         * @param height {number}
         */
        StageText.prototype._open = function (x, y, width, height) {
            if (width === void 0) { width = 160; }
            if (height === void 0) { height = 21; }
        };
        /**
         * @method egret.StageText#add
         */
        StageText.prototype._show = function () {
        };
        StageText.prototype._add = function () {
        };
        /**
         * @method egret.StageText#remove
         */
        StageText.prototype._remove = function () {
        };
        StageText.prototype._hide = function () {
        };
        //        public _draw():void {
        //
        //        }
        StageText.prototype._addListeners = function () {
        };
        StageText.prototype._removeListeners = function () {
        };
        StageText.prototype._setScale = function (x, y) {
            this._scaleX = x;
            this._scaleY = y;
        };
        StageText.prototype.changePosition = function (x, y) {
        };
        StageText.prototype._setSize = function (value) {
            this._size = value;
        };
        StageText.prototype._setTextColor = function (value) {
            this._color = value;
        };
        StageText.prototype._setTextFontFamily = function (value) {
            this._fontFamily = value;
        };
        StageText.prototype._setBold = function (value) {
            this._bold = value;
        };
        StageText.prototype._setItalic = function (value) {
            this._italic = value;
        };
        StageText.prototype._setTextAlign = function (value) {
            this._textAlign = value;
        };
        StageText.prototype._setVisible = function (value) {
            this._visible = value;
        };
        StageText.prototype._setWidth = function (value) {
        };
        StageText.prototype._setHeight = function (value) {
        };
        StageText.prototype._setMultiline = function (value) {
            this._multiline = value;
        };
        StageText.prototype._setMaxChars = function (value) {
            this._maxChars = value;
        };
        StageText.prototype._resetStageText = function () {
        };
        StageText.create = function () {
            return null;
        };
        return StageText;
    })(egret.EventDispatcher);
    egret.StageText = StageText;
    StageText.prototype.__class__ = "egret.StageText";
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var egret;
(function (egret) {
    /**
     * @class egret.URLRequestMethod
     * @classdesc URLRequestMethod 类提供了一些值，这些值可指定在将数据发送到服务器时，
     * URLRequest 对象应使用 POST 方法还是 GET 方法。
     */
    var URLRequestMethod = (function () {
        function URLRequestMethod() {
        }
        /**
         * 表示 URLRequest 对象是一个 GET。
         * @constant {string} egret.URLRequestMethod.GET
         */
        URLRequestMethod.GET = "get";
        /**
         * 表示 URLRequest 对象是一个 POST。
         * @constant {string} egret.URLRequestMethod.POST
         */
        URLRequestMethod.POST = "post";
        return URLRequestMethod;
    })();
    egret.URLRequestMethod = URLRequestMethod;
    URLRequestMethod.prototype.__class__ = "egret.URLRequestMethod";
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var egret;
(function (egret) {
    /**
     * @class egret.URLLoaderDataFormat
     * @classdesc URLLoaderDataFormat 类提供了一些用于指定如何接收已下载数据的值。
     */
    var URLLoaderDataFormat = (function () {
        function URLLoaderDataFormat() {
        }
        /**
         * 指定以原始二进制数据形式接收下载的数据。
         * @constant {string} egret.URLLoaderDataFormat.BINARY
         */
        URLLoaderDataFormat.BINARY = "binary";
        /**
         * 指定以文本形式接收已下载的数据。
         * @constant {string} egret.URLLoaderDataFormat.TEXT
         */
        URLLoaderDataFormat.TEXT = "text";
        /**
         * 指定以 URL 编码变量形式接收下载的数据。
         * @constant {string} egret.URLLoaderDataFormat.VARIABLES
         */
        URLLoaderDataFormat.VARIABLES = "variables";
        /**
         * 指定以位图纹理形式接收已下载的数据。
         * @constant {string} egret.URLLoaderDataFormat.TEXTURE
         */
        URLLoaderDataFormat.TEXTURE = "texture";
        /**
         * 指定以声音形式接收已下载的数据。
         * @constant {string} egret.URLLoaderDataFormat.SOUND
         */
        URLLoaderDataFormat.SOUND = "sound";
        return URLLoaderDataFormat;
    })();
    egret.URLLoaderDataFormat = URLLoaderDataFormat;
    URLLoaderDataFormat.prototype.__class__ = "egret.URLLoaderDataFormat";
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var egret;
(function (egret) {
    /**
     * @class egret.URLVariables
     * @classdesc
     * 使用 URLVariables 类可以在应用程序和服务器之间传输变量。
     * 将 URLVariables 对象与 URLLoader 类的方法、URLRequest 类的 data 属性一起使用。
     * @extends egret.HashObject
     */
    var URLVariables = (function (_super) {
        __extends(URLVariables, _super);
        /**
         * @method egret.URLVariables#constructor
         * @param source {String} 包含名称/值对的 URL 编码的字符串。
         */
        function URLVariables(source) {
            if (source === void 0) { source = null; }
            _super.call(this);
            if (source !== null) {
                this.decode(source);
            }
        }
        /**
         * 将变量字符串转换为此 URLVariables.variables 对象的属性。
         * @method egret.URLVariables#decode
         * @param source {string}
         */
        URLVariables.prototype.decode = function (source) {
            if (!this.variables) {
                this.variables = {};
            }
            source = source.split("+").join(" ");
            var tokens, re = /[?&]?([^=]+)=([^&]*)/g;
            while (tokens = re.exec(source)) {
                this.variables[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
            }
        };
        /**
         * 以 MIME 内容编码格式 application/x-www-form-urlencoded 返回包含所有可枚举变量的字符串。
         * @method egret.URLVariables#toString
         */
        URLVariables.prototype.toString = function () {
            if (!this.variables) {
                return "";
            }
            var variables = this.variables;
            var str = "";
            var isFirst = true;
            for (var key in variables) {
                if (isFirst) {
                    isFirst = false;
                }
                else {
                    str += "&";
                }
                str += key + "=" + variables[key];
            }
            return str;
        };
        return URLVariables;
    })(egret.HashObject);
    egret.URLVariables = URLVariables;
    URLVariables.prototype.__class__ = "egret.URLVariables";
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var egret;
(function (egret) {
    /**
     * @class egret.URLRequest
     * @classdesc URLRequest 类可捕获单个 HTTP 请求中的所有信息。
     * @extends egret.HashObject
     */
    var URLRequest = (function (_super) {
        __extends(URLRequest, _super);
        /**
         * 实例化一个URLRequest对象
         * @method egret.URLRequest#constructor
         * @param url {string} 进行网络请求的地址
         */
        function URLRequest(url) {
            if (url === void 0) { url = null; }
            _super.call(this);
            /**
             * 请求方式，有效值为URLRequestMethod.GET 或 URLRequestMethod.POST。
             * @member {string} egret.URLRequest#method
             */
            this.method = egret.URLRequestMethod.GET;
            this.url = url;
        }
        return URLRequest;
    })(egret.HashObject);
    egret.URLRequest = URLRequest;
    URLRequest.prototype.__class__ = "egret.URLRequest";
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var egret;
(function (egret) {
    /**
     * @class egret.URLLoader
     * @classdesc
     * URLLoader 类以文本、二进制数据或 URL 编码变量的形式从 URL 下载数据。在下载文本文件、XML 或其他用于动态数据驱动应用程序的信息时，它很有用。
     * URLLoader 对象会先从 URL 中下载所有数据，然后才将数据用于应用程序中的代码。它会发出有关下载进度的通知，
     * 通过 bytesLoaded 和 bytesTotal 属性以及已调度的事件，可以监视下载进度。
     * @extends egret.EventDispatcher
     */
    var URLLoader = (function (_super) {
        __extends(URLLoader, _super);
        /**
         * @method egret.URLLoader#constructor
         * @param request {URLRequest} 一个 URLRequest 对象，指定要下载的 URL。
         * 如果省略该参数，则不开始加载操作。如果已指定参数，则立即开始加载操作
         */
        function URLLoader(request) {
            if (request === void 0) { request = null; }
            _super.call(this);
            /**
             * 控制是以文本 (URLLoaderDataFormat.TEXT)、原始二进制数据 (URLLoaderDataFormat.BINARY) 还是 URL 编码变量 (URLLoaderDataFormat.VARIABLES) 接收下载的数据。
             * 如果 dataFormat 属性的值是 URLLoaderDataFormat.TEXT，则所接收的数据是一个包含已加载文件文本的字符串。
             * 如果 dataFormat 属性的值是 URLLoaderDataFormat.BINARY，则所接收的数据是一个包含原始二进制数据的 ByteArray 对象。
             * 如果 dataFormat 属性的值是 URLLoaderDataFormat.TEXTURE，则所接收的数据是一个包含位图数据的Texture对象。
             * 如果 dataFormat 属性的值是 URLLoaderDataFormat.VARIABLES，则所接收的数据是一个包含 URL 编码变量的 URLVariables 对象。
             * 默认值:URLLoaderDataFormat.TEXT
             * @member {string} egret.URLLoader#dataFormat
             */
            this.dataFormat = egret.URLLoaderDataFormat.TEXT;
            this._status = -1;
            if (request) {
                this.load(request);
            }
        }
        /**
         * 从指定的 URL 发送和加载数据。可以以文本、原始二进制数据或 URL 编码变量格式接收数据，这取决于为 dataFormat 属性所设置的值。
         * 请注意 dataFormat 属性的默认值为文本。如果想将数据发送至指定的 URL，则可以在 URLRequest 对象中设置 data 属性。
         * @method egret.URLLoader#load
         * @param request {URLRequest}  一个 URLRequest 对象，指定要下载的 URL。
         */
        URLLoader.prototype.load = function (request) {
            this._request = request;
            this.data = null;
            egret.MainContext.instance.netContext.proceed(this);
        };
        return URLLoader;
    })(egret.EventDispatcher);
    egret.URLLoader = URLLoader;
    URLLoader.prototype.__class__ = "egret.URLLoader";
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var egret;
(function (egret) {
    /**
     * @class egret.Texture
     * @classdesc 纹理类是对不同平台不同的图片资源的封装
     * 在HTML5中，资源是一个HTMLElement对象
     * 在OpenGL / WebGL中，资源是一个提交GPU后获取的纹理id
     * Texture类封装了这些底层实现的细节，开发者只需要关心接口即可
     */
    var Texture = (function (_super) {
        __extends(Texture, _super);
        function Texture() {
            _super.call(this);
            /**
             * 表示这个纹理在bitmapData上的x起始位置
             */
            this._bitmapX = 0;
            /**
             * 表示这个纹理在bitmapData上的y起始位置
             */
            this._bitmapY = 0;
            /**
             * 表示这个纹理在bitmapData上的宽度
             */
            this._bitmapWidth = 0;
            /**
             * 表示这个纹理在bitmapData上的高度
             */
            this._bitmapHeight = 0;
            /**
             * 表示这个纹理显示了之后在x方向的渲染偏移量
             */
            this._offsetX = 0;
            /**
             * 表示这个纹理显示了之后在y方向的渲染偏移量
             */
            this._offsetY = 0;
            this._textureWidth = 0;
            this._textureHeight = 0;
        }
        Object.defineProperty(Texture.prototype, "textureWidth", {
            /**
             * 纹理宽度
             * @member {number} egret.Texture#textureWidth
             */
            get: function () {
                return this._textureWidth;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Texture.prototype, "textureHeight", {
            /**
             * 纹理高度
             * @member {number} egret.Texture#textureWidth
             */
            get: function () {
                return this._textureHeight;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Texture.prototype, "bitmapData", {
            /**
             * 纹理对象中得位图数据
             * @member {any} egret.Texture#bitmapData
             */
            get: function () {
                return this._bitmapData;
            },
            enumerable: true,
            configurable: true
        });
        Texture.prototype._setBitmapData = function (value) {
            var scale = egret.MainContext.instance.rendererContext.texture_scale_factor;
            this._bitmapData = value;
            this._sourceWidth = value.width;
            this._sourceHeight = value.height;
            this._textureWidth = this._sourceWidth * scale;
            this._textureHeight = this._sourceHeight * scale;
            this._bitmapWidth = this._textureWidth;
            this._bitmapHeight = this._textureHeight;
            this._offsetX = this._offsetY = this._bitmapX = this._bitmapY = 0;
        };
        /**
         * 获取某一点像素的颜色值
         * @method egret.Texture#getPixel32
         * @param x 像素点的X轴坐标
         * @param y 像素点的Y轴坐标
         * @returns {number} 指定像素点的颜色值
         */
        Texture.prototype.getPixel32 = function (x, y) {
            var result = this._bitmapData.getContext("2d").getImageData(x, y, 1, 1);
            return result.data;
        };
        return Texture;
    })(egret.HashObject);
    egret.Texture = Texture;
    Texture.prototype.__class__ = "egret.Texture";
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var egret;
(function (egret) {
    /**
     * @class egret.RenderTexture
     * @classdesc
     * RenderTexture 是动态纹理类，他实现了将显示对象及其子对象绘制成为一个纹理的功能
     * @extends egret.Texture
     */
    var RenderTexture = (function (_super) {
        __extends(RenderTexture, _super);
        function RenderTexture() {
            _super.call(this);
            this._bitmapData = document.createElement("canvas");
            this.renderContext = egret.RendererContext.createRendererContext(this._bitmapData);
        }
        /**
         * 将制定显示对象绘制为一个纹理
         * @method egret.RenderTexture#drawToTexture
         * @param displayObject {egret.DisplayObject}
         */
        RenderTexture.prototype.drawToTexture = function (displayObject) {
            var cacheCanvas = this._bitmapData;
            var bounds = displayObject.getBounds(egret.Rectangle.identity);
            cacheCanvas.width = bounds.width;
            cacheCanvas.height = bounds.height;
            if (this.renderContext._cacheCanvas) {
                this.renderContext._cacheCanvas.width = bounds.width;
                this.renderContext._cacheCanvas.height = bounds.height;
            }
            displayObject._worldTransform.identity();
            displayObject.worldAlpha = 1;
            if (displayObject instanceof egret.DisplayObjectContainer) {
                var anchorOffsetX = displayObject._anchorOffsetX;
                var anchorOffsetY = displayObject._anchorOffsetY;
                if (displayObject._anchorX != 0 || displayObject._anchorY != 0) {
                    anchorOffsetX = displayObject._anchorX * bounds.width;
                    anchorOffsetY = displayObject._anchorY * bounds.height;
                }
                this._offsetX = bounds.x + anchorOffsetX;
                this._offsetY = bounds.y + anchorOffsetY;
                displayObject._worldTransform.append(1, 0, 0, 1, -this._offsetX, -this._offsetY);
                var list = displayObject._children;
                for (var i = 0, length = list.length; i < length; i++) {
                    var child = list[i];
                    child._updateTransform();
                }
            }
            var renderFilter = egret.RenderFilter.getInstance();
            var drawAreaList = renderFilter._drawAreaList.concat();
            renderFilter._drawAreaList.length = 0;
            this.renderContext.clearScreen();
            this.renderContext.onRenderStart();
            this.webGLTexture = null; //gl.deleteTexture(this.webGLTexture);
            var mask = displayObject.mask || displayObject._scrollRect;
            if (mask) {
                this.renderContext.pushMask(mask);
            }
            displayObject._render(this.renderContext);
            if (mask) {
                this.renderContext.popMask();
            }
            renderFilter._drawAreaList = drawAreaList;
            this.renderContext.onRenderFinish();
            this._textureWidth = this._bitmapData.width;
            this._textureHeight = this._bitmapData.height;
            this._sourceWidth = this._textureWidth;
            this._sourceHeight = this._textureHeight;
            //测试代码
            //            this.renderContext.canvasContext.setTransform(1, 0, 0, 1, 0, 0);
            //            this.renderContext.strokeRect(0, 0,cacheCanvas.width,cacheCanvas.height,"#ff0000");
            //            document.documentElement.appendChild(cacheCanvas);
        };
        return RenderTexture;
    })(egret.Texture);
    egret.RenderTexture = RenderTexture;
    RenderTexture.prototype.__class__ = "egret.RenderTexture";
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var egret;
(function (egret) {
    /**
     * @class egret.RendererContext
     * @classdesc
     * RenderContext是游戏的渲染上下文。
     * 这是一个抽象基类，制定主要的接口
     * @extends egret.HashObject
     */
    var RendererContext = (function (_super) {
        __extends(RendererContext, _super);
        /**
         * @method egret.RendererContext#constructor
         */
        function RendererContext() {
            _super.call(this);
            /**
             * 渲染全部纹理的时间开销
             * @member egret.RendererContext#renderCost
             */
            this.renderCost = 0;
            /**
             * 绘制纹理的缩放比率，默认值为1
             * @member egret.RendererContext#texture_scale_factor
             */
            this.texture_scale_factor = 1;
            this.profiler = egret.Profiler.getInstance();
        }
        /**
         * @method egret.RendererContext#clearScreen
         * @private
         */
        RendererContext.prototype.clearScreen = function () {
        };
        /**
         * 清除Context的渲染区域
         * @method egret.RendererContext#clearRect
         * @param x {number}
         * @param y {number}
         * @param w {number}
         * @param h {numbe}
         */
        RendererContext.prototype.clearRect = function (x, y, w, h) {
        };
        /**
         * 绘制图片
         * @method egret.RendererContext#drawImage
         * @param texture {Texture}
         * @param sourceX {any}
         * @param sourceY {any}
         * @param sourceWidth {any}
         * @param sourceHeight {any}
         * @param destX {any}
         * @param destY {any}
         * @param destWidth {any}
         * @param destHeigh {any}
         */
        RendererContext.prototype.drawImage = function (texture, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight, repeat) {
            if (repeat === void 0) { repeat = "no-repeat"; }
            this.profiler.onDrawImage();
        };
        /**
         * 变换Context的当前渲染矩阵
         * @method egret.RendererContext#setTransform
         * @param matrix {egret.Matri}
         */
        RendererContext.prototype.setTransform = function (matrix) {
        };
        /**
         * 设置渲染alpha
         * @method egret.RendererContext#setAlpha
         * @param value {number}
         * @param blendMode {egret.BlendMod}
         */
        RendererContext.prototype.setAlpha = function (value, blendMode) {
        };
        /**
         * 设置渲染文本参数
         * @method egret.RendererContext#setupFont
         * @param textField {TextField}
         */
        RendererContext.prototype.setupFont = function (textField) {
        };
        /**
         * 测量文本
         * @method egret.RendererContext#measureText
         * @param text {string}
         * @returns {number}
         * @stable B 参数很可能会需要调整，和setupFont整合
         */
        RendererContext.prototype.measureText = function (text) {
            return 0;
        };
        /**
         * 绘制文本
         * @method egret.RendererContext#drawText
         * @param textField {egret.TextField}
         * @param text {string}
         * @param x {number}
         * @param y {number}
         * @param maxWidth {numbe}
         */
        RendererContext.prototype.drawText = function (textField, text, x, y, maxWidth, style) {
            this.profiler.onDrawImage();
        };
        RendererContext.prototype.strokeRect = function (x, y, w, h, color) {
        };
        RendererContext.prototype.pushMask = function (mask) {
        };
        RendererContext.prototype.popMask = function () {
        };
        RendererContext.prototype.onRenderStart = function () {
        };
        RendererContext.prototype.onRenderFinish = function () {
        };
        RendererContext.prototype.setGlobalColorTransform = function (colorTransformMatrix) {
        };
        RendererContext.createRendererContext = function (canvas) {
            return null;
        };
        /**
         * 是否对图像使用平滑处理
         * 该特性目前只支持Canvas
         */
        RendererContext.imageSmoothingEnabled = true;
        return RendererContext;
    })(egret.HashObject);
    egret.RendererContext = RendererContext;
    RendererContext.prototype.__class__ = "egret.RendererContext";
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var egret;
(function (egret) {
    var InteractionMode = (function () {
        function InteractionMode() {
        }
        /**
         * 使用鼠标交互模式。
         */
        InteractionMode.MOUSE = "mouse";
        /**
         * 使用触摸交互模式。
         */
        InteractionMode.TOUCH = "touch";
        /**
         * 当前Egret使用的交互模式。
         */
        InteractionMode.mode = "touch";
        return InteractionMode;
    })();
    egret.InteractionMode = InteractionMode;
    InteractionMode.prototype.__class__ = "egret.InteractionMode";
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var egret;
(function (egret) {
    /**
     *
     * @class egret.TouchContext
     * @classdesc TouchContext是egret的触摸Context
     */
    var TouchContext = (function (_super) {
        __extends(TouchContext, _super);
        function TouchContext() {
            _super.call(this);
            this._currentTouchTarget = {};
            this.maxTouches = 2;
            this.touchDownTarget = {};
            this.touchingIdentifiers = [];
            this.lastTouchX = -1;
            this.lastTouchY = -1;
        }
        /**
         * 启动触摸检测
         * @method egret.TouchContext#run
         */
        TouchContext.prototype.run = function () {
        };
        TouchContext.prototype.getTouchData = function (identifier, x, y) {
            var obj = this._currentTouchTarget[identifier];
            if (obj == null) {
                obj = {};
                this._currentTouchTarget[identifier] = obj;
            }
            obj.stageX = x;
            obj.stageY = y;
            obj.identifier = identifier;
            return obj;
        };
        TouchContext.prototype.dispatchEvent = function (type, data) {
            var touchDown = (this.touchDownTarget[data.identifier] == true);
            egret.TouchEvent.dispatchTouchEvent(data.target, type, data.identifier, data.stageX, data.stageY, false, false, false, touchDown);
        };
        TouchContext.prototype.onTouchBegan = function (x, y, identifier) {
            if (this.touchingIdentifiers.length == this.maxTouches) {
                return;
            }
            var stage = egret.MainContext.instance.stage;
            var result = stage.hitTest(x, y);
            if (result) {
                var obj = this.getTouchData(identifier, x, y);
                this.touchDownTarget[identifier] = true;
                obj.target = result;
                obj.beginTarget = result;
                this.dispatchEvent(egret.TouchEvent.TOUCH_BEGIN, obj);
            }
            this.touchingIdentifiers.push(identifier);
        };
        TouchContext.prototype.onTouchMove = function (x, y, identifier) {
            var index = this.touchingIdentifiers.indexOf(identifier);
            if (index == -1) {
                return;
            }
            if (x == this.lastTouchX && y == this.lastTouchY) {
                return;
            }
            this.lastTouchX = x;
            this.lastTouchY = y;
            var stage = egret.MainContext.instance.stage;
            var result = stage.hitTest(x, y);
            if (result) {
                var obj = this.getTouchData(identifier, x, y);
                obj.target = result;
                this.dispatchEvent(egret.TouchEvent.TOUCH_MOVE, obj);
            }
        };
        TouchContext.prototype.onTouchEnd = function (x, y, identifier) {
            var index = this.touchingIdentifiers.indexOf(identifier);
            if (index == -1) {
                return;
            }
            this.touchingIdentifiers.splice(index, 1);
            var stage = egret.MainContext.instance.stage;
            var result = stage.hitTest(x, y);
            if (result) {
                var obj = this.getTouchData(identifier, x, y);
                delete this.touchDownTarget[identifier];
                var oldTarget = obj.beginTarget;
                obj.target = result;
                this.dispatchEvent(egret.TouchEvent.TOUCH_END, obj);
                if (oldTarget == result) {
                    this.dispatchEvent(egret.TouchEvent.TOUCH_TAP, obj);
                }
                else if (obj.beginTarget) {
                    obj.target = obj.beginTarget;
                    this.dispatchEvent(egret.TouchEvent.TOUCH_RELEASE_OUTSIDE, obj);
                }
                delete this._currentTouchTarget[obj.identifier];
            }
        };
        return TouchContext;
    })(egret.HashObject);
    egret.TouchContext = TouchContext;
    TouchContext.prototype.__class__ = "egret.TouchContext";
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var egret;
(function (egret) {
    /**
     * @class egret.NetContext
     * @classdesc
     * @extends egret.HashObject
     */
    var NetContext = (function (_super) {
        __extends(NetContext, _super);
        function NetContext() {
            _super.call(this);
        }
        NetContext.prototype.proceed = function (loader) {
        };
        NetContext._getUrl = function (request) {
            var url = request.url;
            //get请求没有设置参数，而是设置URLVariables的情况
            if (url.indexOf("?") == -1 && request.method == egret.URLRequestMethod.GET && request.data && request.data instanceof egret.URLVariables) {
                url = url + "?" + request.data.toString();
            }
            return url;
        };
        return NetContext;
    })(egret.HashObject);
    egret.NetContext = NetContext;
    NetContext.prototype.__class__ = "egret.NetContext";
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var egret;
(function (egret) {
    /**
     * @class egret.DeviceContext
     * @classdesc
     * @extends egret.HashObject
     */
    var DeviceContext = (function (_super) {
        __extends(DeviceContext, _super);
        /**
         * @method egret.DeviceContext#constructor
         */
        function DeviceContext() {
            _super.call(this);
            /**
             * @member egret.DeviceContext#frameRate
             */
            this.frameRate = 60;
        }
        /**
         * @method egret.DeviceContext#executeMainLoop
         * @param callback {Function}
         * @param thisObject {any}
         */
        DeviceContext.prototype.executeMainLoop = function (callback, thisObject) {
        };
        return DeviceContext;
    })(egret.HashObject);
    egret.DeviceContext = DeviceContext;
    DeviceContext.prototype.__class__ = "egret.DeviceContext";
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var egret;
(function (egret) {
    var ExternalInterface = (function () {
        function ExternalInterface() {
        }
        /**
         * 将信息传递给 Egret 外层容器。
         * 如果该容器是 HTML 页，则此方法不可用。
         * 如果该容器是某个 App 容器，该容器将处理该事件。
         * @method egret.ExternalInterface#call
         * @param functionName {string}
         * @param value {string}
         */
        ExternalInterface.call = function (functionName, value) {
        };
        /**
         * 添加外层容器调用侦听，该容器将传递一个字符串给 Egret 容器
         * 如果该容器是 HTML 页，则此方法不可用。
         * @method egret.ExternalInterface#addCallBack
         * @param functionName {string}
         * @param listener {Function}
         */
        ExternalInterface.addCallback = function (functionName, listener) {
        };
        return ExternalInterface;
    })();
    egret.ExternalInterface = ExternalInterface;
    ExternalInterface.prototype.__class__ = "egret.ExternalInterface";
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var egret;
(function (egret) {
    /**
     * 这个类是HTML5的WebWrapper的第一个版本
     */
    var Browser = (function (_super) {
        __extends(Browser, _super);
        function Browser() {
            _super.call(this);
            this.ua = navigator.userAgent.toLowerCase();
            this.trans = this._getTrans();
        }
        Browser.getInstance = function () {
            if (Browser.instance == null) {
                Browser.instance = new Browser();
            }
            return Browser.instance;
        };
        Object.defineProperty(Browser.prototype, "isMobile", {
            /**
             * @deprecated
             * @returns {boolean}
             */
            get: function () {
                egret.Logger.warning("Browser.isMobile接口参数已经变更，请尽快调整用法为 egret.MainContext.deviceType == egret.MainContext.DEVICE_MOBILE ");
                return egret.MainContext.deviceType == egret.MainContext.DEVICE_MOBILE;
            },
            enumerable: true,
            configurable: true
        });
        Browser.prototype._getHeader = function (tempStyle) {
            if ("transform" in tempStyle) {
                return "";
            }
            var transArr = ["webkit", "ms", "Moz", "O"];
            for (var i = 0; i < transArr.length; i++) {
                var transform = transArr[i] + 'Transform';
                if (transform in tempStyle)
                    return transArr[i];
            }
            return "";
        };
        Browser.prototype._getTrans = function () {
            var tempStyle = document.createElement('div').style;
            var _header = this._getHeader(tempStyle);
            var type = "transform";
            if (_header == "") {
                return type;
            }
            return _header + type.charAt(0).toUpperCase() + type.substr(1);
        };
        Browser.prototype.$new = function (x) {
            return this.$(document.createElement(x));
        };
        Browser.prototype.$ = function (x) {
            var parent = document;
            var el = (x instanceof HTMLElement) ? x : parent.querySelector(x);
            if (el) {
                el.find = el.find || this.$;
                el.hasClass = el.hasClass || function (cls) {
                    return this.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
                };
                el.addClass = el.addClass || function (cls) {
                    if (!this.hasClass(cls)) {
                        if (this.className) {
                            this.className += " ";
                        }
                        this.className += cls;
                    }
                    return this;
                };
                el.removeClass = el.removeClass || function (cls) {
                    if (this.hasClass(cls)) {
                        this.className = this.className.replace(cls, '');
                    }
                    return this;
                };
                el.remove = el.remove || function () {
                    //                    if (this.parentNode)
                    //                        this.parentNode.removeChild(this);
                    //                        return this;
                };
                el.appendTo = el.appendTo || function (x) {
                    x.appendChild(this);
                    return this;
                };
                el.prependTo = el.prependTo || function (x) {
                    (x.childNodes[0]) ? x.insertBefore(this, x.childNodes[0]) : x.appendChild(this);
                    return this;
                };
                el.transforms = el.transforms || function () {
                    this.style[Browser.getInstance().trans] = Browser.getInstance().translate(this.position) + Browser.getInstance().rotate(this.rotation) + Browser.getInstance().scale(this.scale) + Browser.getInstance().skew(this.skew);
                    return this;
                };
                el.position = el.position || { x: 0, y: 0 };
                el.rotation = el.rotation || 0;
                el.scale = el.scale || { x: 1, y: 1 };
                el.skew = el.skew || { x: 0, y: 0 };
                el.translates = function (x, y) {
                    this.position.x = x;
                    this.position.y = y - egret.MainContext.instance.stage.stageHeight;
                    this.transforms();
                    return this;
                };
                el.rotate = function (x) {
                    this.rotation = x;
                    this.transforms();
                    return this;
                };
                el.resize = function (x, y) {
                    this.scale.x = x;
                    this.scale.y = y;
                    this.transforms();
                    return this;
                };
                el.setSkew = function (x, y) {
                    this.skew.x = x;
                    this.skew.y = y;
                    this.transforms();
                    return this;
                };
            }
            return el;
        };
        Browser.prototype.translate = function (a) {
            return "translate(" + a.x + "px, " + a.y + "px) ";
        };
        Browser.prototype.rotate = function (a) {
            return "rotate(" + a + "deg) ";
        };
        Browser.prototype.scale = function (a) {
            return "scale(" + a.x + ", " + a.y + ") ";
        };
        Browser.prototype.skew = function (a) {
            return "skewX(" + -a.x + "deg) skewY(" + a.y + "deg)";
        };
        return Browser;
    })(egret.HashObject);
    egret.Browser = Browser;
    Browser.prototype.__class__ = "egret.Browser";
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var egret;
(function (egret) {
    var localStorage;
    (function (localStorage) {
        /**
         * 读取数据
         * @method egret.localStorage.getItem
         * @param key {string} 要读取的键名称
         */
        function getItem(key) {
            return null;
        }
        localStorage.getItem = getItem;
        /**
         * 保存数据
         * @method egret.localStorage.setItem
         * @param key {string} 要保存的键名称
         * @param value {string} 要保存的值
         * @returns {boolean} 数据保存是否成功
         */
        function setItem(key, value) {
            return false;
        }
        localStorage.setItem = setItem;
        /**
         * 删除数据
         * @method egret.localStorage.removeItem
         * @param key {string} 要删除的键名称
         */
        function removeItem(key) {
        }
        localStorage.removeItem = removeItem;
        /**
         * 将所有数据清空
         * @method egret.localStorage.clear
         */
        function clear() {
        }
        localStorage.clear = clear;
    })(localStorage = egret.localStorage || (egret.localStorage = {}));
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var egret;
(function (egret) {
    /**
     * @class egret.XML
     * @classdesc
     * XML文件解析工具，它将XML文件解析为标准的JSON对象返回。
     * 用法类似JSON.parse(),传入一个XML字符串给XML.parse()，将能得到一个标准JSON对象。
     * 示例：<root value="abc">
     *          <item value="item0"/>
     *          <item value="item1"/>
     *       </root>
     * 将解析为:
     * {"name":"root","$value":"abc","children":[{"name":"item","$value":"item0"},{"name":"item","$value":"item0"}]};
     * 其中XML上的属性节点都使用$+"属性名"的方式表示,子节点都存放在children属性的列表里，name表示节点名称。
     */
    var XML = (function () {
        function XML() {
        }
        /**
         * 解析一个XML字符串为JSON对象。
         * @method egret.XML.parse
         * @param value {string} 要解析的XML字符串。
         * @returns {any}
         */
        XML.parse = function (value) {
            var xmlDoc = egret.SAXParser.getInstance().parserXML(value);
            if (!xmlDoc || !xmlDoc.childNodes) {
                return null;
            }
            var length = xmlDoc.childNodes.length;
            var found = false;
            for (var i = 0; i < length; i++) {
                var node = xmlDoc.childNodes[i];
                if (node.nodeType == 1) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                return null;
            }
            var xml = XML.parseNode(node);
            return xml;
        };
        XML.parseNode = function (node) {
            if (!node || node.nodeType != 1) {
                return null;
            }
            var xml = {};
            xml.localName = node.localName;
            xml.name = node.nodeName;
            if (node.namespaceURI)
                xml.namespace = node.namespaceURI;
            if (node.prefix)
                xml.prefix = node.prefix;
            var attributes = node.attributes;
            var length = attributes.length;
            for (var i = 0; i < length; i++) {
                var attrib = attributes[i];
                var key = attrib.name;
                if (key.indexOf("xmlns:") == 0) {
                    continue;
                }
                xml["$" + key] = attrib.value;
            }
            var children = node.childNodes;
            length = children.length;
            for (i = 0; i < length; i++) {
                var childNode = children[i];
                var childXML = XML.parseNode(childNode);
                if (childXML) {
                    if (!xml.children) {
                        xml.children = [];
                    }
                    childXML.parent = xml;
                    xml.children.push(childXML);
                }
            }
            if (!xml.children) {
                var text = node.textContent.trim();
                if (text) {
                    xml.text = text;
                }
            }
            return xml;
        };
        /**
         * 查找xml上符合节点路径的所有子节点。
         * @method egret.XML.findChildren
         * @param xml {any} 要查找的XML节点。
         * @param path {string} 子节点路径，例如"item.node"
         * @param result {egret.Array<any>} 可选参数，传入一个数组用于存储查找的结果。这样做能避免重复创建对象。
         * @returns {any}
         */
        XML.findChildren = function (xml, path, result) {
            if (!result) {
                result = [];
            }
            else {
                result.length = 0;
            }
            XML.findByPath(xml, path, result);
            return result;
        };
        /**
         * @method egret.XML.findByPath
         * @param xml {any}
         * @param path {string}
         * @param result {egret.Array<any>}
         */
        XML.findByPath = function (xml, path, result) {
            var index = path.indexOf(".");
            var key;
            var end;
            if (index == -1) {
                key = path;
                end = true;
            }
            else {
                key = path.substring(0, index);
                path = path.substring(index + 1);
                end = false;
            }
            var children = xml.children;
            if (!children) {
                return;
            }
            var length = children.length;
            for (var i = 0; i < length; i++) {
                var child = children[i];
                if (child.localName == key) {
                    if (end) {
                        result.push(child);
                    }
                    else {
                        XML.findByPath(child, path, result);
                    }
                }
            }
        };
        /**
         * 获取一个XML节点上的所有属性名列表
         * @method egret.XML.getAttributes
         * @param xml {any} 要查找的XML节点。
         * @param result {egret.Array<any>} 可选参数，传入一个数组用于存储查找的结果。这样做能避免重复创建对象。
         * @returns {string}
         */
        XML.getAttributes = function (xml, result) {
            if (!result) {
                result = [];
            }
            else {
                result.length = 0;
            }
            for (var key in xml) {
                if (key.charAt(0) == "$") {
                    result.push(key.substring(1));
                }
            }
            return result;
        };
        return XML;
    })();
    egret.XML = XML;
    XML.prototype.__class__ = "egret.XML";
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var egret;
(function (egret) {
    /**
     * Endian 类中包含一些值，它们表示用于表示多字节数字的字节顺序。
     * 字节顺序为 bigEndian（最高有效字节位于最前）或 littleEndian（最低有效字节位于最前）。
     * @class egret.Endian
     * @classdesc
     */
    var Endian = (function () {
        function Endian() {
        }
        /**
         * 表示多字节数字的最低有效字节位于字节序列的最前面。
         * 十六进制数字 0x12345678 包含 4 个字节（每个字节包含 2 个十六进制数字）。最高有效字节为 0x12。最低有效字节为 0x78。（对于等效的十进制数字 305419896，最高有效数字是 3，最低有效数字是 6）。
         * @constant {string} egret.Endian.LITTLE_ENDIAN
         */
        Endian.LITTLE_ENDIAN = "LITTLE_ENDIAN";
        /**
         * 表示多字节数字的最高有效字节位于字节序列的最前面。
         * 十六进制数字 0x12345678 包含 4 个字节（每个字节包含 2 个十六进制数字）。最高有效字节为 0x12。最低有效字节为 0x78。（对于等效的十进制数字 305419896，最高有效数字是 3，最低有效数字是 6）。
         * @constant {string} egret.Endian.BIG_ENDIAN
         */
        Endian.BIG_ENDIAN = "BIG_ENDIAN";
        return Endian;
    })();
    egret.Endian = Endian;
    Endian.prototype.__class__ = "egret.Endian";
    /**
     * @class egret.ByteArray
     * @classdesc
     * ByteArray 类提供用于优化读取、写入以及处理二进制数据的方法和属性。
     * 注意：ByteArray 类适用于需要在字节层访问数据的高级开发人员。
     * 内存中的数据是一个压缩字节数组（数据类型的最紧凑表示形式），但可以使用标准数组访问运算符来操作 ByteArray 类的实例。
     */
    var ByteArray = (function () {
        function ByteArray() {
            /**
             * 将文件指针的当前位置（以字节为单位）移动或返回到 ByteArray 对象中。
             * 下一次调用读取方法时将在此位置开始读取，或者下一次调用写入方法时将在此位置开始写入。
             * @member {number} egret.ByteArray#position
             */
            this.position = 0;
            /**
             * ByteArray 对象的长度（以字节为单位）。
             * 如果将长度设置为大于当前长度的值，则用零填充字节数组的右侧；如果将长度设置为小于当前长度的值，将会截断该字节数组。
             * @member {number} egret.ByteArray#length
             */
            this.length = 0;
            this._mode = "";
            this.maxlength = 0;
            this._endian = Endian.LITTLE_ENDIAN;
            this.isLittleEndian = false;
            this._mode = "Typed array";
            this.maxlength = 4;
            this.arraybytes = new ArrayBuffer(this.maxlength);
            this.unalignedarraybytestemp = new ArrayBuffer(16);
            this.endian = ByteArray.DEFAULT_ENDIAN;
        }
        Object.defineProperty(ByteArray.prototype, "endian", {
            /**
             * 更改或读取数据的字节顺序。
             * 请使用egret.Endian.BIG_ENDIAN 或 egret.Endian.LITTLE_ENDIAN表示。
             * @member {string} egret.ByteArray#endian
             */
            get: function () {
                return this._endian;
            },
            set: function (value) {
                this._endian = value;
                this.isLittleEndian = value == Endian.LITTLE_ENDIAN;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * @method egret.ByteArray#ensureWriteableSpace
         * @param n {number}
         */
        ByteArray.prototype.ensureWriteableSpace = function (n) {
            this.ensureSpace(n + this.position);
        };
        /**
         * @method egret.ByteArray#setArrayBuffer
         * @param aBuffer {egret.ArrayBuffer}
         */
        ByteArray.prototype.setArrayBuffer = function (aBuffer) {
            this.ensureSpace(aBuffer.byteLength);
            this.length = aBuffer.byteLength;
            var inInt8AView = new Int8Array(aBuffer);
            var localInt8View = new Int8Array(this.arraybytes, 0, this.length);
            localInt8View.set(inInt8AView);
            this.position = 0;
        };
        Object.defineProperty(ByteArray.prototype, "bytesAvailable", {
            /**
             * 可从字节数组的当前位置到数组末尾读取的数据的字节数。【只读】
             * 每次访问 ByteArray 对象时，将 bytesAvailable 属性与读取方法结合使用，以确保读取有效的数据。
             * @method egret.ByteArray#getBytesAvailable
             * @returns {number}
             */
            get: function () {
                return (this.length) - (this.position);
            },
            enumerable: true,
            configurable: true
        });
        /**
         * @method egret.ByteArray#ensureSpace
         * @param n {number}
         */
        ByteArray.prototype.ensureSpace = function (n) {
            if (n > this.maxlength) {
                var newmaxlength = (n + 255) & (~255);
                var newarraybuffer = new ArrayBuffer(newmaxlength);
                var view = new Uint8Array(this.arraybytes, 0, this.length);
                var newview = new Uint8Array(newarraybuffer, 0, this.length);
                newview.set(view); // memcpy
                this.arraybytes = newarraybuffer;
                this.maxlength = newmaxlength;
            }
        };
        /**
         * 在字节流中写入一个字节。
         * 使用参数的低 8 位。忽略高 24 位。
         * @method egret.ByteArray#writeByte
         * @param b {number}  一个 32 位整数。低 8 位将被写入字节流。
         */
        ByteArray.prototype.writeByte = function (b) {
            this.ensureWriteableSpace(1);
            var view = new Int8Array(this.arraybytes);
            view[this.position++] = (~~b); // ~~ is cast to int in js...
            if (this.position > this.length) {
                this.length = this.position;
            }
        };
        /**
         * 从字节流中读取带符号的字节。
         * 返回值的范围是从 -128 到 127。
         * @method egret.ByteArray#readByte
         * @returns {number} 介于 -128 和 127 之间的整数。
         */
        ByteArray.prototype.readByte = function () {
            if (this.position >= this.length) {
                throw "ByteArray out of bounds read. Positon=" + this.position + ", Length=" + this.length;
            }
            var view = new Int8Array(this.arraybytes);
            return view[this.position++];
        };
        /**
         * 从字节流中读取 length 参数指定的数据字节数。从 offset 指定的位置开始，将字节读入 bytes 参数指定的 ByteArray 对象中，并将字节写入目标 ByteArray 中。
         * @method egret.ByteArray#readBytes
         * @param bytes {egret.ByteArray} 要将数据读入的 ByteArray 对象。
         * @param offset {number} bytes 中的偏移（位置），应从该位置写入读取的数据。
         * @param length {number} 要读取的字节数。默认值 0 导致读取所有可用的数据。

         */
        ByteArray.prototype.readBytes = function (bytes, offset, length) {
            if (offset === void 0) { offset = 0; }
            if (length === void 0) { length = 0; }
            if (length == null) {
                length = bytes.length;
            }
            bytes.ensureWriteableSpace(offset + length);
            var byteView = new Int8Array(bytes.arraybytes);
            var localByteView = new Int8Array(this.arraybytes);
            byteView.set(localByteView.subarray(this.position, this.position + length), offset);
            this.position += length;
            if (length + offset > bytes.length) {
                bytes.length += (length + offset) - bytes.length;
            }
        };
        /**
         * 在字节流中写入一个无符号的字节。
         * @method egret.ByteArray#writeUnsignedByte
         * @param b {number} 介于 0 到 255 之间的无符号字节。
         */
        ByteArray.prototype.writeUnsignedByte = function (b) {
            this.ensureWriteableSpace(1);
            var view = new Uint8Array(this.arraybytes);
            view[this.position++] = (~~b) & 0xff; // ~~ is cast to int in js...
            if (this.position > this.length) {
                this.length = this.position;
            }
        };
        /**
         * 从字节流中读取无符号的字节。
         * 返回值的范围是从 0 到 255。
         * @method egret.ByteArray#readUnsignedByte 介于 0 到 255 之间的无符号字节。
         */
        ByteArray.prototype.readUnsignedByte = function () {
            if (this.position >= this.length) {
                throw "ByteArray out of bounds read. Positon=" + this.position + ", Length=" + this.length;
            }
            var view = new Uint8Array(this.arraybytes);
            return view[this.position++];
        };
        /**
         *在字节流中写入一个无符号的 16 位整数。
         * @method egret.ByteArray#writeUnsignedShort
         * @param b {number}  介于 0 到 65535 之间的无符号整数。
         */
        ByteArray.prototype.writeUnsignedShort = function (b) {
            this.ensureWriteableSpace(2);
            if ((this.position & 1) == 0) {
                var view = new Uint16Array(this.arraybytes);
                view[this.position >> 1] = (~~b) & 0xffff; // ~~ is cast to int in js...
            }
            else {
                var view = new Uint16Array(this.unalignedarraybytestemp, 0, 1);
                view[0] = (~~b) & 0xffff;
                var view2 = new Uint8Array(this.arraybytes, this.position, 2);
                var view3 = new Uint8Array(this.unalignedarraybytestemp, 0, 2);
                view2.set(view3);
            }
            this.position += 2;
            if (this.position > this.length) {
                this.length = this.position;
            }
        };
        /**
         * 从字节流中读取一个由 length 参数指定的 UTF-8 字节序列，并返回一个字符串。
         * @method egret.ByteArray#readUTFBytes
         * @param len {number} 指明 UTF-8 字节长度的无符号短整型数。
         * @returns {string} 由指定长度的 UTF-8 字节组成的字符串。
         */
        ByteArray.prototype.readUTFBytes = function (len) {
            var value = "";
            var max = this.position + len;
            var data = new DataView(this.arraybytes);
            while (this.position < max) {
                var c = data.getUint8(this.position++);
                if (c < 0x80) {
                    if (c == 0)
                        break;
                    value += String.fromCharCode(c);
                }
                else if (c < 0xE0) {
                    value += String.fromCharCode(((c & 0x3F) << 6) | (data.getUint8(this.position++) & 0x7F));
                }
                else if (c < 0xF0) {
                    var c2 = data.getUint8(this.position++);
                    value += String.fromCharCode(((c & 0x1F) << 12) | ((c2 & 0x7F) << 6) | (data.getUint8(this.position++) & 0x7F));
                }
                else {
                    var c2 = data.getUint8(this.position++);
                    var c3 = data.getUint8(this.position++);
                    value += String.fromCharCode(((c & 0x0F) << 18) | ((c2 & 0x7F) << 12) | ((c3 << 6) & 0x7F) | (data.getUint8(this.position++) & 0x7F));
                }
            }
            return value;
        };
        /**
         * 从字节流中读取一个带符号的 32 位整数。
         * 返回值的范围是从 -2147483648 到 2147483647。
         * @method egret.ByteArray#readInt
         * @returns {number} 介于 -2147483648 到 2147483647 之间的整数。
         */
        ByteArray.prototype.readInt = function () {
            var data = new DataView(this.arraybytes);
            var intNumber = data.getInt32(this.position, this.isLittleEndian);
            this.position += 4;
            return intNumber;
        };
        /**
         * 从字节流中读取一个带符号的 16 位整数。
         * 返回值的范围是从 -32768 到 32767。
         * @method egret.ByteArray#readShort
         * @returns {number} 介于 -32768 到 32767 之间的整数。
         */
        ByteArray.prototype.readShort = function () {
            var data = new DataView(this.arraybytes);
            var shortNumber = data.getInt16(this.position, this.isLittleEndian);
            this.position += 2;
            return shortNumber;
        };
        /**
         * 从字节流中读取一个 IEEE 754 双精度（64 位）浮点数。
         * @method egret.ByteArray#readDouble
         * @returns {number} 返回双精度（64 位）浮点数。
         */
        ByteArray.prototype.readDouble = function () {
            var data = new DataView(this.arraybytes);
            var doubleNumber = data.getFloat64(this.position, this.isLittleEndian);
            this.position += 8;
            return doubleNumber;
        };
        /**
         * 从字节流中读取一个无符号的 16 位整数。
         * 返回值的范围是从 0 到 65535。
         * @method egret.ByteArray#readUnsignedShort
         * @returns {number} 介于 0 到 65535 之间的无符号整数。
         */
        ByteArray.prototype.readUnsignedShort = function () {
            if (this.position > this.length + 2) {
                throw "ByteArray out of bounds read. Position=" + this.position + ", Length=" + this.length;
            }
            if ((this.position & 1) == 0) {
                var view = new Uint16Array(this.arraybytes);
                var pa = this.position >> 1;
                this.position += 2;
                return view[pa];
            }
            else {
                var view = new Uint16Array(this.unalignedarraybytestemp, 0, 1);
                var view2 = new Uint8Array(this.arraybytes, this.position, 2);
                var view3 = new Uint8Array(this.unalignedarraybytestemp, 0, 2);
                view3.set(view2);
                this.position += 2;
                return view[0];
            }
        };
        /**
         * 在字节流中写入一个无符号的 32 位整数。
         * @method egret.ByteArray#writeUnsignedInt
         * @param b {number} 介于 0 和 4294967295 之间的无符号整数。
         */
        ByteArray.prototype.writeUnsignedInt = function (b) {
            this.ensureWriteableSpace(4);
            if ((this.position & 3) == 0) {
                var view = new Uint32Array(this.arraybytes);
                view[this.position >> 2] = (~~b) & 0xffffffff; // ~~ is cast to int in js...
            }
            else {
                var view = new Uint32Array(this.unalignedarraybytestemp, 0, 1);
                view[0] = (~~b) & 0xffffffff;
                var view2 = new Uint8Array(this.arraybytes, this.position, 4);
                var view3 = new Uint8Array(this.unalignedarraybytestemp, 0, 4);
                view2.set(view3);
            }
            this.position += 4;
            if (this.position > this.length) {
                this.length = this.position;
            }
        };
        /**
         * 从字节流中读取一个无符号的 32 位整数。
         * 返回值的范围是从 0 到 4294967295。
         * @method egret.ByteArray#readUnsignedInt
         *  @returns {number} 介于 0 和 4294967295 之间的 32 位无符号整数。
         */
        ByteArray.prototype.readUnsignedInt = function () {
            if (this.position > this.length + 4) {
                throw "ByteArray out of bounds read. Position=" + this.position + ", Length=" + this.length;
            }
            if ((this.position & 3) == 0) {
                var view = new Uint32Array(this.arraybytes);
                var pa = this.position >> 2;
                this.position += 4;
                return view[pa];
            }
            else {
                var view = new Uint32Array(this.unalignedarraybytestemp, 0, 1);
                var view2 = new Uint8Array(this.arraybytes, this.position, 4);
                var view3 = new Uint8Array(this.unalignedarraybytestemp, 0, 4);
                view3.set(view2);
                this.position += 4;
                return view[0];
            }
        };
        /**
         * 在字节流中写入一个 IEEE 754 单精度（32 位）浮点数。
         * @method egret.ByteArray#writeFloat
         * @param b {number} 单精度（32 位）浮点数。
         */
        ByteArray.prototype.writeFloat = function (b) {
            this.ensureWriteableSpace(4);
            if ((this.position & 3) == 0) {
                var view = new Float32Array(this.arraybytes);
                view[this.position >> 2] = b;
            }
            else {
                var view = new Float32Array(this.unalignedarraybytestemp, 0, 1);
                view[0] = b;
                var view2 = new Uint8Array(this.arraybytes, this.position, 4);
                var view3 = new Uint8Array(this.unalignedarraybytestemp, 0, 4);
                view2.set(view3);
            }
            this.position += 4;
            if (this.position > this.length) {
                this.length = this.position;
            }
        };
        /**
         * 从字节流中读取一个 IEEE 754 单精度（32 位）浮点数。
         * @method egret.ByteArray#readFloat
         * @returns {number} 单精度（32 位）浮点数。
         */
        ByteArray.prototype.readFloat = function () {
            if (this.position > this.length + 4) {
                throw "ByteArray out of bounds read. Positon=" + this.position + ", Length=" + this.length;
            }
            if ((this.position & 3) == 0) {
                var view = new Float32Array(this.arraybytes);
                var pa = this.position >> 2;
                this.position += 4;
                return view[pa];
            }
            else {
                var view = new Float32Array(this.unalignedarraybytestemp, 0, 1);
                var view2 = new Uint8Array(this.arraybytes, this.position, 4);
                var view3 = new Uint8Array(this.unalignedarraybytestemp, 0, 4);
                view3.set(view2);
                this.position += 4;
                return view[0];
            }
        };
        /**
         * 默认表示多字节数字的字节顺序的常量
         * @constant {string} egret.ByteArray.DEFAULT_ENDIAN
         */
        ByteArray.DEFAULT_ENDIAN = Endian.BIG_ENDIAN;
        return ByteArray;
    })();
    egret.ByteArray = ByteArray;
    ByteArray.prototype.__class__ = "egret.ByteArray";
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var egret;
(function (egret) {
    /**
     * @class egret.Tween
     * @classdesc
     * Tween是Egret的动画缓动类
     * @extends egret.EventDispatcher
     */
    var Tween = (function (_super) {
        __extends(Tween, _super);
        function Tween(target, props, pluginData) {
            _super.call(this);
            this._target = null;
            this._useTicks = false;
            this.ignoreGlobalPause = false;
            this.loop = false;
            this.pluginData = null;
            this._steps = null;
            this._actions = null;
            this.paused = false;
            this.duration = 0;
            this._prevPos = -1;
            this.position = null;
            this._prevPosition = 0;
            this._stepPosition = 0;
            this.passive = false;
            this.initialize(target, props, pluginData);
        }
        /**
         * 激活一个显示对象，对其添加 Tween 动画
         * @method egret.Tween.get
         * @param target {egret.DisplayObject} 要激活的显示对象
         */
        Tween.get = function (target, props, pluginData, override) {
            if (props === void 0) { props = null; }
            if (pluginData === void 0) { pluginData = null; }
            if (override === void 0) { override = false; }
            if (override) {
                Tween.removeTweens(target);
            }
            return new Tween(target, props, pluginData);
        };
        /**
         * 删除一个显示对象上的全部 Tween 动画
         * @method egret.Tween.removeTweens
         * @param target {egret.DisplayObject}
         */
        Tween.removeTweens = function (target) {
            if (!target.tween_count) {
                return;
            }
            var tweens = Tween._tweens;
            for (var i = tweens.length - 1; i >= 0; i--) {
                if (tweens[i]._target == target) {
                    tweens[i].paused = true;
                    tweens.splice(i, 1);
                }
            }
            target.tween_count = 0;
        };
        /**
         * 暂停某个元件的所有缓动
         * @param target
         */
        Tween.pauseTweens = function (target) {
            if (!target.tween_count) {
                return;
            }
            var tweens = egret.Tween._tweens;
            for (var i = tweens.length - 1; i >= 0; i--) {
                if (tweens[i]._target == target) {
                    tweens[i].paused = true;
                }
            }
        };
        /**
         * 继续播放某个元件的所有缓动
         * @param target
         */
        Tween.resumeTweens = function (target) {
            if (!target.tween_count) {
                return;
            }
            var tweens = egret.Tween._tweens;
            for (var i = tweens.length - 1; i >= 0; i--) {
                if (tweens[i]._target == target) {
                    tweens[i].paused = false;
                }
            }
        };
        Tween.tick = function (delta, paused) {
            if (paused === void 0) { paused = false; }
            var tweens = Tween._tweens.concat();
            for (var i = tweens.length - 1; i >= 0; i--) {
                var tween = tweens[i];
                if ((paused && !tween.ignoreGlobalPause) || tween.paused) {
                    continue;
                }
                tween.tick(tween._useTicks ? 1 : delta);
            }
        };
        Tween._register = function (tween, value) {
            var target = tween._target;
            var tweens = Tween._tweens;
            if (value) {
                if (target) {
                    target.tween_count = target.tween_count ? target.tween_count + 1 : 1;
                }
                tweens.push(tween);
                if (!Tween._inited) {
                    egret.Ticker.getInstance().register(Tween.tick, null);
                    Tween._inited = true;
                }
            }
            else {
                if (target) {
                    target.tween_count--;
                }
                var i = tweens.length;
                while (i--) {
                    if (tweens[i] == tween) {
                        tweens.splice(i, 1);
                        return;
                    }
                }
            }
        };
        /**
         * @method egret.Tween.removeAllTweens
         */
        Tween.removeAllTweens = function () {
            var tweens = Tween._tweens;
            for (var i = 0, l = tweens.length; i < l; i++) {
                var tween = tweens[i];
                tween.paused = true;
                tween._target.tweenjs_count = 0;
            }
            tweens.length = 0;
        };
        Tween.prototype.initialize = function (target, props, pluginData) {
            this._target = target;
            if (props) {
                this._useTicks = props.useTicks;
                this.ignoreGlobalPause = props.ignoreGlobalPause;
                this.loop = props.loop;
                props.onChange && this.addEventListener("change", props.onChange, props.onChangeObj);
                if (props.override) {
                    Tween.removeTweens(target);
                }
            }
            this.pluginData = pluginData || {};
            this._curQueueProps = {};
            this._initQueueProps = {};
            this._steps = [];
            this._actions = [];
            if (props && props.paused) {
                this.paused = true;
            }
            else {
                Tween._register(this, true);
            }
            if (props && props.position != null) {
                this.setPosition(props.position, Tween.NONE);
            }
        };
        Tween.prototype.setPosition = function (value, actionsMode) {
            if (actionsMode === void 0) { actionsMode = 1; }
            if (value < 0) {
                value = 0;
            }
            //正常化位置
            var t = value;
            var end = false;
            if (t >= this.duration) {
                if (this.loop) {
                    t = t % this.duration;
                }
                else {
                    t = this.duration;
                    end = true;
                }
            }
            if (t == this._prevPos) {
                return end;
            }
            var prevPos = this._prevPos;
            this.position = this._prevPos = t;
            this._prevPosition = value;
            if (this._target) {
                if (end) {
                    //结束
                    this._updateTargetProps(null, 1);
                }
                else if (this._steps.length > 0) {
                    for (var i = 0, l = this._steps.length; i < l; i++) {
                        if (this._steps[i].t > t) {
                            break;
                        }
                    }
                    var step = this._steps[i - 1];
                    this._updateTargetProps(step, (this._stepPosition = t - step.t) / step.d);
                }
            }
            //执行actions
            if (actionsMode != 0 && this._actions.length > 0) {
                if (this._useTicks) {
                    this._runActions(t, t);
                }
                else if (actionsMode == 1 && t < prevPos) {
                    if (prevPos != this.duration) {
                        this._runActions(prevPos, this.duration);
                    }
                    this._runActions(0, t, true);
                }
                else {
                    this._runActions(prevPos, t);
                }
            }
            if (end) {
                this.setPaused(true);
            }
            this.dispatchEventWith("change");
            return end;
        };
        Tween.prototype._runActions = function (startPos, endPos, includeStart) {
            if (includeStart === void 0) { includeStart = false; }
            var sPos = startPos;
            var ePos = endPos;
            var i = -1;
            var j = this._actions.length;
            var k = 1;
            if (startPos > endPos) {
                //把所有的倒置
                sPos = endPos;
                ePos = startPos;
                i = j;
                j = k = -1;
            }
            while ((i += k) != j) {
                var action = this._actions[i];
                var pos = action.t;
                if (pos == ePos || (pos > sPos && pos < ePos) || (includeStart && pos == startPos)) {
                    action.f.apply(action.o, action.p);
                }
            }
        };
        Tween.prototype._updateTargetProps = function (step, ratio) {
            var p0, p1, v, v0, v1, arr;
            if (!step && ratio == 1) {
                this.passive = false;
                p0 = p1 = this._curQueueProps;
            }
            else {
                this.passive = !!step.v;
                //不更新props.
                if (this.passive) {
                    return;
                }
                //使用ease
                if (step.e) {
                    ratio = step.e(ratio, 0, 1, 1);
                }
                p0 = step.p0;
                p1 = step.p1;
            }
            for (var n in this._initQueueProps) {
                if ((v0 = p0[n]) == null) {
                    p0[n] = v0 = this._initQueueProps[n];
                }
                if ((v1 = p1[n]) == null) {
                    p1[n] = v1 = v0;
                }
                if (v0 == v1 || ratio == 0 || ratio == 1 || (typeof (v0) != "number")) {
                    v = ratio == 1 ? v1 : v0;
                }
                else {
                    v = v0 + (v1 - v0) * ratio;
                }
                var ignore = false;
                if (arr = Tween._plugins[n]) {
                    for (var i = 0, l = arr.length; i < l; i++) {
                        var v2 = arr[i].tween(this, n, v, p0, p1, ratio, !!step && p0 == p1, !step);
                        if (v2 == Tween.IGNORE) {
                            ignore = true;
                        }
                        else {
                            v = v2;
                        }
                    }
                }
                if (!ignore) {
                    this._target[n] = v;
                }
            }
        };
        /**
         * @method egret.Tween#setPaused
         * @param value {boolean}
         * @returns {egret.Tween}
         */
        Tween.prototype.setPaused = function (value) {
            this.paused = value;
            Tween._register(this, !value);
            return this;
        };
        Tween.prototype._cloneProps = function (props) {
            var o = {};
            for (var n in props) {
                o[n] = props[n];
            }
            return o;
        };
        Tween.prototype._addStep = function (o) {
            if (o.d > 0) {
                this._steps.push(o);
                o.t = this.duration;
                this.duration += o.d;
            }
            return this;
        };
        Tween.prototype._appendQueueProps = function (o) {
            var arr, oldValue, i, l, injectProps;
            for (var n in o) {
                if (this._initQueueProps[n] === undefined) {
                    oldValue = this._target[n];
                    //设置plugins
                    if (arr = Tween._plugins[n]) {
                        for (i = 0, l = arr.length; i < l; i++) {
                            oldValue = arr[i].init(this, n, oldValue);
                        }
                    }
                    this._initQueueProps[n] = this._curQueueProps[n] = (oldValue === undefined) ? null : oldValue;
                }
                else {
                    oldValue = this._curQueueProps[n];
                }
            }
            for (var n in o) {
                oldValue = this._curQueueProps[n];
                if (arr = Tween._plugins[n]) {
                    injectProps = injectProps || {};
                    for (i = 0, l = arr.length; i < l; i++) {
                        if (arr[i].step) {
                            arr[i].step(this, n, oldValue, o[n], injectProps);
                        }
                    }
                }
                this._curQueueProps[n] = o[n];
            }
            if (injectProps) {
                this._appendQueueProps(injectProps);
            }
            return this._curQueueProps;
        };
        Tween.prototype._addAction = function (o) {
            o.t = this.duration;
            this._actions.push(o);
            return this;
        };
        Tween.prototype._set = function (props, o) {
            for (var n in props) {
                o[n] = props[n];
            }
        };
        /**
         * 等待指定毫秒后执行下一个动画
         * @method egret.Tween#wait
         * @param duration {number} 要等待的时间，以毫秒为单位
         * @param passive {boolean}
         * @returns {egret.Tween}
         */
        Tween.prototype.wait = function (duration, passive) {
            if (duration == null || duration <= 0) {
                return this;
            }
            var o = this._cloneProps(this._curQueueProps);
            return this._addStep({ d: duration, p0: o, p1: o, v: passive });
        };
        /**
         * 将指定显示对象的属性修改为指定值
         * @method egret.Tween#to
         * @param props {Object} 对象的属性集合
         * @param duration {number} 持续时间
         * @param ease {egret.Ease} 缓动算法
         * @returns {egret.Tween}
         */
        Tween.prototype.to = function (props, duration, ease) {
            if (ease === void 0) { ease = undefined; }
            if (isNaN(duration) || duration < 0) {
                duration = 0;
            }
            return this._addStep({ d: duration || 0, p0: this._cloneProps(this._curQueueProps), e: ease, p1: this._cloneProps(this._appendQueueProps(props)) });
        };
        /**
         * 执行回调函数
         * @method egret.Tween#call
         * @param callback {Function}
         * @param thisObj {Object}
         * @param params {Object}
         * @returns {egret.Tween}
         */
        Tween.prototype.call = function (callback, thisObj, params) {
            if (thisObj === void 0) { thisObj = undefined; }
            if (params === void 0) { params = undefined; }
            return this._addAction({ f: callback, p: params ? params : [], o: thisObj ? thisObj : this._target });
        };
        Tween.prototype.set = function (props, target) {
            if (target === void 0) { target = null; }
            return this._addAction({ f: this._set, o: this, p: [props, target ? target : this._target] });
        };
        /**
         * @method egret.Tween#play
         * @param tween {egret.Tween}
         * @returns {egret.Tween}
         */
        Tween.prototype.play = function (tween) {
            if (!tween) {
                tween = this;
            }
            return this.call(tween.setPaused, tween, [false]);
        };
        /**
         * @method egret.Tween#pause
         * @param tween {egret.Tween}
         * @returns {egret.Tween}
         */
        Tween.prototype.pause = function (tween) {
            if (!tween) {
                tween = this;
            }
            return this.call(tween.setPaused, tween, [true]);
        };
        /**
         * @method egret.Tween#tick
         * @param delta {number}
         */
        Tween.prototype.tick = function (delta) {
            if (this.paused) {
                return;
            }
            this.setPosition(this._prevPosition + delta);
        };
        /**
         * @constant {any} egret.Tween.NONE
         */
        Tween.NONE = 0;
        /**
         * @constant {any} egret.Tween.LOOP
         */
        Tween.LOOP = 1;
        /**
         * @constant {any} egret.Tween.REVERSE
         */
        Tween.REVERSE = 2;
        Tween._tweens = [];
        Tween.IGNORE = {};
        Tween._plugins = {};
        Tween._inited = false;
        return Tween;
    })(egret.EventDispatcher);
    egret.Tween = Tween;
    Tween.prototype.__class__ = "egret.Tween";
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var egret;
(function (egret) {
    var Ease = (function () {
        function Ease() {
            egret.Logger.fatal("Ease不能被实例化");
        }
        Ease.get = function (amount) {
            if (amount < -1) {
                amount = -1;
            }
            if (amount > 1) {
                amount = 1;
            }
            return function (t) {
                if (amount == 0) {
                    return t;
                }
                if (amount < 0) {
                    return t * (t * -amount + 1 + amount);
                }
                return t * ((2 - t) * amount + (1 - amount));
            };
        };
        Ease.getPowIn = function (pow) {
            return function (t) {
                return Math.pow(t, pow);
            };
        };
        Ease.getPowOut = function (pow) {
            return function (t) {
                return 1 - Math.pow(1 - t, pow);
            };
        };
        Ease.getPowInOut = function (pow) {
            return function (t) {
                if ((t *= 2) < 1)
                    return 0.5 * Math.pow(t, pow);
                return 1 - 0.5 * Math.abs(Math.pow(2 - t, pow));
            };
        };
        Ease.sineIn = function (t) {
            return 1 - Math.cos(t * Math.PI / 2);
        };
        Ease.sineOut = function (t) {
            return Math.sin(t * Math.PI / 2);
        };
        Ease.sineInOut = function (t) {
            return -0.5 * (Math.cos(Math.PI * t) - 1);
        };
        Ease.getBackIn = function (amount) {
            return function (t) {
                return t * t * ((amount + 1) * t - amount);
            };
        };
        Ease.getBackOut = function (amount) {
            return function (t) {
                return (--t * t * ((amount + 1) * t + amount) + 1);
            };
        };
        Ease.getBackInOut = function (amount) {
            amount *= 1.525;
            return function (t) {
                if ((t *= 2) < 1)
                    return 0.5 * (t * t * ((amount + 1) * t - amount));
                return 0.5 * ((t -= 2) * t * ((amount + 1) * t + amount) + 2);
            };
        };
        Ease.circIn = function (t) {
            return -(Math.sqrt(1 - t * t) - 1);
        };
        Ease.circOut = function (t) {
            return Math.sqrt(1 - (--t) * t);
        };
        Ease.circInOut = function (t) {
            if ((t *= 2) < 1) {
                return -0.5 * (Math.sqrt(1 - t * t) - 1);
            }
            return 0.5 * (Math.sqrt(1 - (t -= 2) * t) + 1);
        };
        Ease.bounceIn = function (t) {
            return 1 - Ease.bounceOut(1 - t);
        };
        Ease.bounceOut = function (t) {
            if (t < 1 / 2.75) {
                return (7.5625 * t * t);
            }
            else if (t < 2 / 2.75) {
                return (7.5625 * (t -= 1.5 / 2.75) * t + 0.75);
            }
            else if (t < 2.5 / 2.75) {
                return (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375);
            }
            else {
                return (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375);
            }
        };
        Ease.bounceInOut = function (t) {
            if (t < 0.5)
                return Ease.bounceIn(t * 2) * .5;
            return Ease.bounceOut(t * 2 - 1) * 0.5 + 0.5;
        };
        Ease.getElasticIn = function (amplitude, period) {
            var pi2 = Math.PI * 2;
            return function (t) {
                if (t == 0 || t == 1)
                    return t;
                var s = period / pi2 * Math.asin(1 / amplitude);
                return -(amplitude * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * pi2 / period));
            };
        };
        Ease.getElasticOut = function (amplitude, period) {
            var pi2 = Math.PI * 2;
            return function (t) {
                if (t == 0 || t == 1)
                    return t;
                var s = period / pi2 * Math.asin(1 / amplitude);
                return (amplitude * Math.pow(2, -10 * t) * Math.sin((t - s) * pi2 / period) + 1);
            };
        };
        Ease.getElasticInOut = function (amplitude, period) {
            var pi2 = Math.PI * 2;
            return function (t) {
                var s = period / pi2 * Math.asin(1 / amplitude);
                if ((t *= 2) < 1)
                    return -0.5 * (amplitude * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * pi2 / period));
                return amplitude * Math.pow(2, -10 * (t -= 1)) * Math.sin((t - s) * pi2 / period) * 0.5 + 1;
            };
        };
        Ease.quadIn = Ease.getPowIn(2);
        Ease.quadOut = Ease.getPowOut(2);
        Ease.quadInOut = Ease.getPowInOut(2);
        Ease.cubicIn = Ease.getPowIn(3);
        Ease.cubicOut = Ease.getPowOut(3);
        Ease.cubicInOut = Ease.getPowInOut(3);
        Ease.quartIn = Ease.getPowIn(4);
        Ease.quartOut = Ease.getPowOut(4);
        Ease.quartInOut = Ease.getPowInOut(4);
        Ease.quintIn = Ease.getPowIn(5);
        Ease.quintOut = Ease.getPowOut(5);
        Ease.quintInOut = Ease.getPowInOut(5);
        Ease.backIn = Ease.getBackIn(1.7);
        Ease.backOut = Ease.getBackOut(1.7);
        Ease.backInOut = Ease.getBackInOut(1.7);
        Ease.elasticIn = Ease.getElasticIn(1, 0.3);
        Ease.elasticOut = Ease.getElasticOut(1, 0.3);
        Ease.elasticInOut = Ease.getElasticInOut(1, 0.3 * 1.5);
        return Ease;
    })();
    egret.Ease = Ease;
    Ease.prototype.__class__ = "egret.Ease";
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var egret;
(function (egret) {
    /**
     * @class egret.Sound
     * @classdesc Sound 类允许您在应用程序中使用声音。
     */
    var Sound = (function () {
        function Sound() {
            this.type = Sound.EFFECT;
        }
        /**
         * 播放声音
         * @method egret.Sound#play
         * @param loop {boolean} 是否循环播放，默认为false
         */
        Sound.prototype.play = function (loop) {
            if (loop === void 0) { loop = false; }
            var sound = this.audio;
            if (!sound) {
                return;
            }
            if (!isNaN(sound.duration)) {
                sound.currentTime = 0;
            }
            sound.loop = loop;
            sound.play();
        };
        /**
         * 暂停声音
         * @method egret.Sound#pause
         */
        Sound.prototype.pause = function () {
            var sound = this.audio;
            if (!sound) {
                return;
            }
            sound.pause();
        };
        /**
         * 重新加载声音
         * @method egret.Sound#load
         */
        Sound.prototype.load = function () {
            var sound = this.audio;
            if (!sound) {
                return;
            }
            sound.load();
        };
        /**
         * 添加事件监听
         * @param type 事件类型
         * @param listener 监听函数
         */
        Sound.prototype.addEventListener = function (type, listener) {
            var sound = this.audio;
            if (!sound) {
                return;
            }
            this.audio.addEventListener(type, listener, false);
        };
        /**
         * 移除事件监听
         * @param type 事件类型
         * @param listener 监听函数
         */
        Sound.prototype.removeEventListener = function (type, listener) {
            var sound = this.audio;
            if (!sound) {
                return;
            }
            this.audio.removeEventListener(type, listener, false);
        };
        /**
         * 设置音量
         * @param value 值需大于0 小于等于 1
         */
        Sound.prototype.setVolume = function (value) {
            var sound = this.audio;
            if (!sound) {
                return;
            }
            sound.volume = value;
        };
        /**
         * 获取当前音量值
         * @returns number
         */
        Sound.prototype.getVolume = function () {
            return this.audio ? this.audio.volume : 0;
        };
        Sound.prototype.preload = function (type) {
            this.type = type;
        };
        Sound.prototype._setAudio = function (value) {
            this.audio = value;
        };
        Sound.MUSIC = "music";
        Sound.EFFECT = "effect";
        return Sound;
    })();
    egret.Sound = Sound;
    Sound.prototype.__class__ = "egret.Sound";
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var egret;
(function (egret) {
    var NumberUtils = (function () {
        function NumberUtils() {
        }
        NumberUtils.isNumber = function (value) {
            return typeof (value) === "number" && !isNaN(value);
        };
        return NumberUtils;
    })();
    egret.NumberUtils = NumberUtils;
    NumberUtils.prototype.__class__ = "egret.NumberUtils";
})(egret || (egret = {}));
//对未提供bind的浏览器实现bind机制
if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
        if (typeof this !== "function") {
            throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
        }
        var aArgs = Array.prototype.slice.call(arguments, 1), fToBind = this, fNOP = function () {
        }, fBound = function () {
            return fToBind.apply(this instanceof fNOP && oThis ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
        };
        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();
        return fBound;
    };
}

/**
 * Copyright (c) Egret-Labs.org. Permission is hereby granted, free of charge,
 * to any person obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish, distribute,
 * sublicense, and/or sell copies of the Software, and to permit persons to whom
 * the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
 * PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
 * FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var RES;
(function (RES) {
    /**
     * @class RES.ResourceEvent
     * @classdesc
     * @extends egret.Event
     */
    var ResourceEvent = (function (_super) {
        __extends(ResourceEvent, _super);
        /**
         * 构造函数
         * @method RES.ResourceEvent#constructor
         * @param type {string}
         * @param bubbles {boolean}
         * @param cancelable {boolean}
         */
        function ResourceEvent(type, bubbles, cancelable) {
            if (bubbles === void 0) { bubbles = false; }
            if (cancelable === void 0) { cancelable = false; }
            _super.call(this, type, bubbles, cancelable);
            /**
             * 已经加载的文件数
             * @member {number} RES.ResourceEvent#itemsLoaded
             */
            this.itemsLoaded = 0;
            /**
             * 要加载的总文件数
             * @member {number} RES.ResourceEvent#itemsTotal
             */
            this.itemsTotal = 0;
        }
        /**
         * 使用指定的EventDispatcher对象来抛出事件对象。抛出的对象将会缓存在对象池上，供下次循环复用。
         * @method RES.ResourceEvent.dispatchResourceEvent
         * @param target {egret.IEventDispatcher}
         * @param type {string}
         * @param groupName {string}
         * @param resItem {egret.ResourceItem}
         * @param itemsLoaded {number}
         * @param itemsTotal {number}
         */
        ResourceEvent.dispatchResourceEvent = function (target, type, groupName, resItem, itemsLoaded, itemsTotal) {
            if (groupName === void 0) { groupName = ""; }
            if (resItem === void 0) { resItem = null; }
            if (itemsLoaded === void 0) { itemsLoaded = 0; }
            if (itemsTotal === void 0) { itemsTotal = 0; }
            var eventClass = ResourceEvent;
            var props = egret.Event._getPropertyData(eventClass);
            props.groupName = groupName;
            props.resItem = resItem;
            props.itemsLoaded = itemsLoaded;
            props.itemsTotal = itemsTotal;
            egret.Event._dispatchByTarget(eventClass, target, type, props);
        };
        /**
         * 一个加载项加载失败事件。
         * @constant {string} RES.ResourceEvent.ITEM_LOAD_ERROR
         */
        ResourceEvent.ITEM_LOAD_ERROR = "itemLoadError";
        /**
         * 配置文件加载并解析完成事件
         * @constant {string} RES.ResourceEvent.CONFIG_COMPLETE
         */
        ResourceEvent.CONFIG_COMPLETE = "configComplete";
        /**
         * 延迟加载组资源加载进度事件
         * @constant {string} RES.ResourceEvent.GROUP_PROGRESS
         */
        ResourceEvent.GROUP_PROGRESS = "groupProgress";
        /**
         * 延迟加载组资源加载完成事件
         * @constant {string} RES.ResourceEvent.GROUP_COMPLETE
         */
        ResourceEvent.GROUP_COMPLETE = "groupComplete";
        return ResourceEvent;
    })(egret.Event);
    RES.ResourceEvent = ResourceEvent;
    ResourceEvent.prototype.__class__ = "RES.ResourceEvent";
})(RES || (RES = {}));

/**
 * Copyright (c) Egret-Labs.org. Permission is hereby granted, free of charge,
 * to any person obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish, distribute,
 * sublicense, and/or sell copies of the Software, and to permit persons to whom
 * the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
 * PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
 * FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
var RES;
(function (RES) {
    /**
     * @class RES.ResourceItem
     * @classdesc
     */
    var ResourceItem = (function () {
        /**
         * 构造函数
         * @method RES.ResourceItem#constructor
         * @param name {string} 加载项名称
         * @param url {string} 要加载的文件地址
         * @param type {string} 加载项文件类型
         */
        function ResourceItem(name, url, type) {
            this._loaded = false;
            this.name = name;
            this.url = url;
            this.type = type;
        }
        Object.defineProperty(ResourceItem.prototype, "loaded", {
            /**
             * 加载完成的标志
             * @member {boolean} RES.ResourceItem#loaded
             */
            get: function () {
                return this.data ? this.data.loaded : this._loaded;
            },
            set: function (value) {
                if (this.data)
                    this.data.loaded = value;
                this._loaded = value;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * @method RES.ResourceItem#toString
         * @returns {string}
         */
        ResourceItem.prototype.toString = function () {
            return "[ResourceItem name=\"" + this.name + "\" url=\"" + this.url + "\" type=\"" + this.type + "\"]";
        };
        /**
         * XML文件
         * @constant {string} RES.ResourceItem.TYPE_XML
         */
        ResourceItem.TYPE_XML = "xml";
        /**
         * 图片文件
         * @constant {string} RES.ResourceItem.TYPE_IMAGE
         */
        ResourceItem.TYPE_IMAGE = "image";
        /**
         * 二进制流文件
         * @constant {string} RES.ResourceItem.TYPE_BIN
         */
        ResourceItem.TYPE_BIN = "bin";
        /**
         * 文本文件(解析为字符串)
         * @constant {string} RES.ResourceItem.TYPE_TEXT
         */
        ResourceItem.TYPE_TEXT = "text";
        /**
         * JSON文件
         * @constant {string} RES.ResourceItem.TYPE_JSON
         */
        ResourceItem.TYPE_JSON = "json";
        /**
         * SpriteSheet文件
         * @constant {string} RES.ResourceItem.TYPE_SHEET
         */
        ResourceItem.TYPE_SHEET = "sheet";
        /**
         * BitmapTextSpriteSheet文件
         * @constant {string} RES.ResourceItem.TYPE_FONT
         */
        ResourceItem.TYPE_FONT = "font";
        /**
         * 声音文件
         * @constant {string} RES.ResourceItem.TYPE_SOUND
         */
        ResourceItem.TYPE_SOUND = "sound";
        return ResourceItem;
    })();
    RES.ResourceItem = ResourceItem;
    ResourceItem.prototype.__class__ = "RES.ResourceItem";
})(RES || (RES = {}));

/**
 * Copyright (c) Egret-Labs.org. Permission is hereby granted, free of charge,
 * to any person obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish, distribute,
 * sublicense, and/or sell copies of the Software, and to permit persons to whom
 * the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
 * PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
 * FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
var RES;
(function (RES) {
    /**
     * @class RES.ResourceConfig
     * @classdesc
     */
    var ResourceConfig = (function () {
        function ResourceConfig() {
            /**
             * 一级键名字典
             */
            this.keyMap = {};
            /**
             * 加载组字典
             */
            this.groupDic = {};
            RES["configInstance"] = this;
        }
        /**
         * 根据组名获取组加载项列表
         * @method RES.ResourceConfig#getGroupByName
         * @param name {string} 组名
         * @returns {Array<egret.ResourceItem>}
         */
        ResourceConfig.prototype.getGroupByName = function (name) {
            var group = new Array();
            if (!this.groupDic[name])
                return group;
            var list = this.groupDic[name];
            var length = list.length;
            for (var i = 0; i < length; i++) {
                var obj = list[i];
                group.push(this.parseResourceItem(obj));
            }
            return group;
        };
        /**
         * 根据组名获取原始的组加载项列表
         * @method RES.ResourceConfig#getRawGroupByName
         * @param name {string} 组名
         * @returns {Array<any>}
         */
        ResourceConfig.prototype.getRawGroupByName = function (name) {
            if (this.groupDic[name])
                return this.groupDic[name];
            return [];
        };
        /**
         * 创建自定义的加载资源组,注意：此方法仅在资源配置文件加载完成后执行才有效。
         * 可以监听ResourceEvent.CONFIG_COMPLETE事件来确认配置加载完成。
         * @method RES.ResourceConfig#createGroup
         * @param name {string} 要创建的加载资源组的组名
         * @param keys {egret.Array<string>} 要包含的键名列表，key对应配置文件里的name属性或sbuKeys属性的一项或一个资源组名。
         * @param override {boolean} 是否覆盖已经存在的同名资源组,默认false。
         * @returns {boolean}
         */
        ResourceConfig.prototype.createGroup = function (name, keys, override) {
            if (override === void 0) { override = false; }
            if ((!override && this.groupDic[name]) || !keys || keys.length == 0)
                return false;
            var groupDic = this.groupDic;
            var group = [];
            var length = keys.length;
            for (var i = 0; i < length; i++) {
                var key = keys[i];
                var g = groupDic[key];
                if (g) {
                    var len = g.length;
                    for (var j = 0; j < len; j++) {
                        var item = g[j];
                        if (group.indexOf(item) == -1)
                            group.push(item);
                    }
                }
                else {
                    item = this.keyMap[key];
                    if (item && group.indexOf(item) == -1)
                        group.push(item);
                }
            }
            if (group.length == 0)
                return false;
            this.groupDic[name] = group;
            return true;
        };
        /**
         * 解析一个配置文件
         * @method RES.ResourceConfig#parseConfig
         * @param data {any} 配置文件数据
         * @param folder {string} 加载项的路径前缀。
         */
        ResourceConfig.prototype.parseConfig = function (data, folder) {
            if (!data)
                return;
            var resources = data["resources"];
            if (resources) {
                var length = resources.length;
                for (var i = 0; i < length; i++) {
                    var item = resources[i];
                    var url = item.url;
                    if (url && url.indexOf("://") == -1)
                        item.url = folder + url;
                    this.addItemToKeyMap(item);
                }
            }
            var groups = data["groups"];
            if (groups) {
                length = groups.length;
                for (i = 0; i < length; i++) {
                    var group = groups[i];
                    var list = [];
                    var keys = group.keys.split(",");
                    var l = keys.length;
                    for (var j = 0; j < l; j++) {
                        var name = keys[j].trim();
                        item = this.keyMap[name];
                        if (item && list.indexOf(item) == -1) {
                            list.push(item);
                        }
                    }
                    this.groupDic[group.name] = list;
                }
            }
        };
        /**
         * 添加一个二级键名到配置列表。
         * @method RES.ResourceConfig#addSubkey
         * @param subkey {string} 要添加的二级键名
         * @param name {string} 二级键名所属的资源name属性
         */
        ResourceConfig.prototype.addSubkey = function (subkey, name) {
            var item = this.keyMap[name];
            if (item && !this.keyMap[subkey]) {
                this.keyMap[subkey] = item;
            }
        };
        /**
         * 添加一个加载项数据到列表
         */
        ResourceConfig.prototype.addItemToKeyMap = function (item) {
            if (!this.keyMap[item.name])
                this.keyMap[item.name] = item;
            if (item.hasOwnProperty("subkeys")) {
                var subkeys = (item.subkeys).split(",");
                item.subkeys = subkeys;
                var length = subkeys.length;
                for (var i = 0; i < length; i++) {
                    var key = subkeys[i];
                    if (this.keyMap[key] != null)
                        continue;
                    this.keyMap[key] = item;
                }
            }
        };
        /**
         * 获取加载项的name属性
         * @method RES.ResourceConfig#getType
         * @param key {string} 对应配置文件里的name属性或sbuKeys属性的一项。
         * @returns {string}
         */
        ResourceConfig.prototype.getName = function (key) {
            var data = this.keyMap[key];
            return data ? data.name : "";
        };
        /**
         * 获取加载项类型。
         * @method RES.ResourceConfig#getType
         * @param key {string} 对应配置文件里的name属性或sbuKeys属性的一项。
         * @returns {string}
         */
        ResourceConfig.prototype.getType = function (key) {
            var data = this.keyMap[key];
            return data ? data.type : "";
        };
        ResourceConfig.prototype.getRawResourceItem = function (key) {
            return this.keyMap[key];
        };
        /**
         * 获取加载项信息对象
         * @method RES.ResourceConfig#getResourceItem
         * @param key {string} 对应配置文件里的key属性或sbuKeys属性的一项。
         * @returns {egret.ResourceItem}
         */
        ResourceConfig.prototype.getResourceItem = function (key) {
            var data = this.keyMap[key];
            if (data)
                return this.parseResourceItem(data);
            return null;
        };
        /**
         * 转换Object数据为ResourceItem对象
         */
        ResourceConfig.prototype.parseResourceItem = function (data) {
            var resItem = new RES.ResourceItem(data.name, data.url, data.type);
            resItem.data = data;
            return resItem;
        };
        return ResourceConfig;
    })();
    RES.ResourceConfig = ResourceConfig;
    ResourceConfig.prototype.__class__ = "RES.ResourceConfig";
})(RES || (RES = {}));

/**
 * Copyright (c) Egret-Labs.org. Permission is hereby granted, free of charge,
 * to any person obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish, distribute,
 * sublicense, and/or sell copies of the Software, and to permit persons to whom
 * the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
 * PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
 * FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var RES;
(function (RES) {
    /**
     * @class RES.ResourceLoader
     * @classdesc
     * @extends egret.EventDispatcher
     */
    var ResourceLoader = (function (_super) {
        __extends(ResourceLoader, _super);
        /**
         * 构造函数
         * @method RES.ResourceLoader#constructor
         */
        function ResourceLoader() {
            _super.call(this);
            /**
             * 最大并发加载数
             */
            this.thread = 2;
            /**
             * 正在加载的线程计数
             */
            this.loadingCount = 0;
            /**
             * 当前组加载的项总个数,key为groupName
             */
            this.groupTotalDic = {};
            /**
             * 已经加载的项个数,key为groupName
             */
            this.numLoadedDic = {};
            /**
             * 正在加载的组列表,key为groupName
             */
            this.itemListDic = {};
            /**
             * 优先级队列,key为priority，value为groupName列表
             */
            this.priorityQueue = {};
            /**
             * 延迟加载队列
             */
            this.lazyLoadList = new Array();
            /**
             * 资源解析库字典类
             */
            this.analyzerDic = {};
            /**
             * 当前应该加载同优先级队列的第几列
             */
            this.queueIndex = 0;
        }
        /**
         * 检查指定的组是否正在加载中
         * @method RES.ResourceLoader#isGroupInLoading
         * @param groupName {string}
         * @returns {boolean}
         */
        ResourceLoader.prototype.isGroupInLoading = function (groupName) {
            return this.itemListDic[groupName] !== undefined;
        };
        /**
         * 开始加载一组文件
         * @method RES.ResourceLoader#loadGroup
         * @param list {egret.Array<ResourceItem>} 加载项列表
         * @param groupName {string} 组名
         * @param priority {number} 加载优先级
         */
        ResourceLoader.prototype.loadGroup = function (list, groupName, priority) {
            if (priority === void 0) { priority = 0; }
            if (this.itemListDic[groupName] || !groupName)
                return;
            if (!list || list.length == 0) {
                egret.Logger.warning("RES加载了不存在或空的资源组：\"" + groupName + "\"");
                var event = new RES.ResourceEvent(RES.ResourceEvent.GROUP_COMPLETE);
                event.groupName = groupName;
                this.dispatchEvent(event);
                return;
            }
            if (this.priorityQueue[priority])
                this.priorityQueue[priority].push(groupName);
            else
                this.priorityQueue[priority] = [groupName];
            this.itemListDic[groupName] = list;
            var length = list.length;
            for (var i = 0; i < length; i++) {
                var resItem = list[i];
                resItem.groupName = groupName;
            }
            this.groupTotalDic[groupName] = list.length;
            this.numLoadedDic[groupName] = 0;
            this.next();
        };
        /**
         * 加载一个文件
         * @method RES.ResourceLoader#loadItem
         * @param resItem {egret.ResourceItem} 要加载的项
         */
        ResourceLoader.prototype.loadItem = function (resItem) {
            this.lazyLoadList.push(resItem);
            resItem.groupName = "";
            this.next();
        };
        /**
         * 加载下一项
         */
        ResourceLoader.prototype.next = function () {
            while (this.loadingCount < this.thread) {
                var resItem = this.getOneResourceItem();
                if (!resItem)
                    break;
                this.loadingCount++;
                if (resItem.loaded) {
                    this.onItemComplete(resItem);
                }
                else {
                    var analyzer = this.analyzerDic[resItem.type];
                    if (!analyzer) {
                        analyzer = this.analyzerDic[resItem.type] = egret.Injector.getInstance(RES.AnalyzerBase, resItem.type);
                    }
                    analyzer.loadFile(resItem, this.onItemComplete, this);
                }
            }
        };
        /**
         * 获取下一个待加载项
         */
        ResourceLoader.prototype.getOneResourceItem = function () {
            var maxPriority = Number.NEGATIVE_INFINITY;
            for (var p in this.priorityQueue) {
                maxPriority = Math.max(maxPriority, p);
            }
            var queue = this.priorityQueue[maxPriority];
            if (!queue || queue.length == 0) {
                if (this.lazyLoadList.length == 0)
                    return null;
                //后请求的先加载，以便更快获取当前需要的资源
                return this.lazyLoadList.pop();
            }
            var length = queue.length;
            var list;
            for (var i = 0; i < length; i++) {
                if (this.queueIndex >= length)
                    this.queueIndex = 0;
                list = this.itemListDic[queue[this.queueIndex]];
                if (list.length > 0)
                    break;
                this.queueIndex++;
            }
            if (list.length == 0)
                return null;
            return list.shift();
        };
        /**
         * 加载结束
         */
        ResourceLoader.prototype.onItemComplete = function (resItem) {
            this.loadingCount--;
            var groupName = resItem.groupName;
            if (!resItem.loaded) {
                RES.ResourceEvent.dispatchResourceEvent(this.resInstance, RES.ResourceEvent.ITEM_LOAD_ERROR, groupName, resItem);
            }
            if (groupName) {
                this.numLoadedDic[groupName]++;
                var itemsLoaded = this.numLoadedDic[groupName];
                var itemsTotal = this.groupTotalDic[groupName];
                RES.ResourceEvent.dispatchResourceEvent(this.resInstance, RES.ResourceEvent.GROUP_PROGRESS, groupName, resItem, itemsLoaded, itemsTotal);
                if (itemsLoaded == itemsTotal) {
                    this.removeGroupName(groupName);
                    delete this.groupTotalDic[groupName];
                    delete this.numLoadedDic[groupName];
                    delete this.itemListDic[groupName];
                    RES.ResourceEvent.dispatchResourceEvent(this, RES.ResourceEvent.GROUP_COMPLETE, groupName);
                }
            }
            else {
                this.callBack.call(this.resInstance, resItem);
            }
            this.next();
        };
        /**
         * 从优先级队列中移除指定的组名
         */
        ResourceLoader.prototype.removeGroupName = function (groupName) {
            for (var p in this.priorityQueue) {
                var queue = this.priorityQueue[p];
                var length = queue.length;
                var index = 0;
                var found = false;
                var length = queue.length;
                for (var i = 0; i < length; i++) {
                    var name = queue[i];
                    if (name == groupName) {
                        queue.splice(index, 1);
                        found = true;
                        break;
                    }
                    index++;
                }
                if (found) {
                    if (queue.length == 0) {
                        delete this.priorityQueue[p];
                    }
                    break;
                }
            }
        };
        return ResourceLoader;
    })(egret.EventDispatcher);
    RES.ResourceLoader = ResourceLoader;
    ResourceLoader.prototype.__class__ = "RES.ResourceLoader";
})(RES || (RES = {}));

/**
 * Copyright (c) Egret-Labs.org. Permission is hereby granted, free of charge,
 * to any person obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish, distribute,
 * sublicense, and/or sell copies of the Software, and to permit persons to whom
 * the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
 * PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
 * FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var RES;
(function (RES) {
    var AnalyzerBase = (function (_super) {
        __extends(AnalyzerBase, _super);
        function AnalyzerBase() {
            _super.call(this);
            this.resourceConfig = (RES["configInstance"]);
        }
        /**
         * 添加一个二级键名到配置列表。
         * @method RES.ResourceConfig#addSubkey
         * @param subkey {string} 要添加的二级键名
         * @param name {string} 二级键名所属的资源name属性
         */
        AnalyzerBase.prototype.addSubkey = function (subkey, name) {
            this.resourceConfig.addSubkey(subkey, name);
        };
        /**
         * 加载一个资源文件
         * @param resItem 加载项信息
         * @param compFunc 加载完成回调函数,示例:compFunc(resItem:ResourceItem):void;
         * @param thisObject 加载完成回调函数的this引用
         */
        AnalyzerBase.prototype.loadFile = function (resItem, compFunc, thisObject) {
        };
        /**
         * 同步方式获取解析完成的数据
         * @param name 对应配置文件里的name属性。
         */
        AnalyzerBase.prototype.getRes = function (name) {
        };
        /**
         * 销毁某个资源文件的二进制数据,返回是否删除成功。
         * @param name 配置文件中加载项的name属性
         */
        AnalyzerBase.prototype.destroyRes = function (name) {
            return false;
        };
        /**
         * 读取一个字符串里第一个点之前的内容。
         * @param name {string} 要读取的字符串
         */
        AnalyzerBase.getStringPrefix = function (name) {
            if (!name) {
                return "";
            }
            var index = name.indexOf(".");
            if (index != -1) {
                return name.substring(0, index);
            }
            return "";
        };
        /**
         * 读取一个字符串里第一个点之后的内容。
         * @param name {string} 要读取的字符串
         */
        AnalyzerBase.getStringTail = function (name) {
            if (!name) {
                return "";
            }
            var index = name.indexOf(".");
            if (index != -1) {
                return name.substring(index + 1);
            }
            return "";
        };
        return AnalyzerBase;
    })(egret.HashObject);
    RES.AnalyzerBase = AnalyzerBase;
    AnalyzerBase.prototype.__class__ = "RES.AnalyzerBase";
})(RES || (RES = {}));

/**
 * Copyright (c) Egret-Labs.org. Permission is hereby granted, free of charge,
 * to any person obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish, distribute,
 * sublicense, and/or sell copies of the Software, and to permit persons to whom
 * the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
 * PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
 * FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var RES;
(function (RES) {
    var BinAnalyzer = (function (_super) {
        __extends(BinAnalyzer, _super);
        /**
         * 构造函数
         */
        function BinAnalyzer() {
            _super.call(this);
            /**
             * 字节流数据缓存字典
             */
            this.fileDic = {};
            /**
             * 加载项字典
             */
            this.resItemDic = [];
            this._dataFormat = egret.URLLoaderDataFormat.BINARY;
            /**
             * URLLoader对象池
             */
            this.recycler = new egret.Recycler();
        }
        /**
         * @inheritDoc
         */
        BinAnalyzer.prototype.loadFile = function (resItem, compFunc, thisObject) {
            if (this.fileDic[resItem.name]) {
                compFunc.call(thisObject, resItem);
                return;
            }
            var loader = this.getLoader();
            this.resItemDic[loader.hashCode] = { item: resItem, func: compFunc, thisObject: thisObject };
            loader.load(new egret.URLRequest(resItem.url));
        };
        /**
         * 获取一个URLLoader对象
         */
        BinAnalyzer.prototype.getLoader = function () {
            var loader = this.recycler.pop();
            if (!loader) {
                loader = new egret.URLLoader();
                loader.addEventListener(egret.Event.COMPLETE, this.onLoadFinish, this);
                loader.addEventListener(egret.IOErrorEvent.IO_ERROR, this.onLoadFinish, this);
            }
            loader.dataFormat = this._dataFormat;
            return loader;
        };
        /**
         * 一项加载结束
         */
        BinAnalyzer.prototype.onLoadFinish = function (event) {
            var loader = (event.target);
            var data = this.resItemDic[loader.hashCode];
            delete this.resItemDic[loader.hashCode];
            this.recycler.push(loader);
            var resItem = data.item;
            var compFunc = data.func;
            resItem.loaded = (event.type == egret.Event.COMPLETE);
            if (resItem.loaded) {
                this.analyzeData(resItem, loader.data);
            }
            compFunc.call(data.thisObject, resItem);
        };
        /**
         * 解析并缓存加载成功的数据
         */
        BinAnalyzer.prototype.analyzeData = function (resItem, data) {
            var name = resItem.name;
            if (this.fileDic[name] || !data) {
                return;
            }
            this.fileDic[name] = data;
        };
        /**
         * @inheritDoc
         */
        BinAnalyzer.prototype.getRes = function (name) {
            return this.fileDic[name];
        };
        /**
         * @inheritDoc
         */
        BinAnalyzer.prototype.hasRes = function (name) {
            var res = this.getRes(name);
            return res != null;
        };
        /**
         * @inheritDoc
         */
        BinAnalyzer.prototype.destroyRes = function (name) {
            if (this.fileDic[name]) {
                delete this.fileDic[name];
                return true;
            }
            return false;
        };
        return BinAnalyzer;
    })(RES.AnalyzerBase);
    RES.BinAnalyzer = BinAnalyzer;
    BinAnalyzer.prototype.__class__ = "RES.BinAnalyzer";
})(RES || (RES = {}));

/**
 * Copyright (c) Egret-Labs.org. Permission is hereby granted, free of charge,
 * to any person obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish, distribute,
 * sublicense, and/or sell copies of the Software, and to permit persons to whom
 * the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
 * PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
 * FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var RES;
(function (RES) {
    var ImageAnalyzer = (function (_super) {
        __extends(ImageAnalyzer, _super);
        function ImageAnalyzer() {
            _super.call(this);
            this._dataFormat = egret.URLLoaderDataFormat.TEXTURE;
        }
        /**
         * 解析并缓存加载成功的数据
         */
        ImageAnalyzer.prototype.analyzeData = function (resItem, data) {
            var name = resItem.name;
            if (this.fileDic[name] || !data) {
                return;
            }
            this.fileDic[name] = data;
            var config = resItem.data;
            if (config && config["scale9grid"]) {
                var str = config["scale9grid"];
                var list = str.split(",");
                data["scale9Grid"] = new egret.Rectangle(parseInt(list[0]), parseInt(list[1]), parseInt(list[2]), parseInt(list[3]));
            }
        };
        return ImageAnalyzer;
    })(RES.BinAnalyzer);
    RES.ImageAnalyzer = ImageAnalyzer;
    ImageAnalyzer.prototype.__class__ = "RES.ImageAnalyzer";
})(RES || (RES = {}));

/**
 * Copyright (c) Egret-Labs.org. Permission is hereby granted, free of charge,
 * to any person obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish, distribute,
 * sublicense, and/or sell copies of the Software, and to permit persons to whom
 * the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
 * PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
 * FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var RES;
(function (RES) {
    var JsonAnalyzer = (function (_super) {
        __extends(JsonAnalyzer, _super);
        function JsonAnalyzer() {
            _super.call(this);
            this._dataFormat = egret.URLLoaderDataFormat.TEXT;
        }
        /**
         * 解析并缓存加载成功的数据
         */
        JsonAnalyzer.prototype.analyzeData = function (resItem, data) {
            var name = resItem.name;
            if (this.fileDic[name] || !data) {
                return;
            }
            try {
                var str = data;
                this.fileDic[name] = JSON.parse(str);
            }
            catch (e) {
                egret.Logger.warning("JSON文件格式不正确: " + resItem.url + "\ndata:" + data);
            }
        };
        return JsonAnalyzer;
    })(RES.BinAnalyzer);
    RES.JsonAnalyzer = JsonAnalyzer;
    JsonAnalyzer.prototype.__class__ = "RES.JsonAnalyzer";
})(RES || (RES = {}));

/**
 * Copyright (c) Egret-Labs.org. Permission is hereby granted, free of charge,
 * to any person obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish, distribute,
 * sublicense, and/or sell copies of the Software, and to permit persons to whom
 * the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
 * PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
 * FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var RES;
(function (RES) {
    var TextAnalyzer = (function (_super) {
        __extends(TextAnalyzer, _super);
        function TextAnalyzer() {
            _super.call(this);
            this._dataFormat = egret.URLLoaderDataFormat.TEXT;
        }
        return TextAnalyzer;
    })(RES.BinAnalyzer);
    RES.TextAnalyzer = TextAnalyzer;
    TextAnalyzer.prototype.__class__ = "RES.TextAnalyzer";
})(RES || (RES = {}));

/**
 * Copyright (c) Egret-Labs.org. Permission is hereby granted, free of charge,
 * to any person obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish, distribute,
 * sublicense, and/or sell copies of the Software, and to permit persons to whom
 * the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
 * PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
 * FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var RES;
(function (RES) {
    /**
     * SpriteSheet解析器
     */
    var SheetAnalyzer = (function (_super) {
        __extends(SheetAnalyzer, _super);
        function SheetAnalyzer() {
            _super.call(this);
            this.sheetMap = {};
            this.textureMap = {};
            this._dataFormat = egret.URLLoaderDataFormat.TEXT;
        }
        /**
         * @inheritDoc
         */
        SheetAnalyzer.prototype.getRes = function (name) {
            var res = this.fileDic[name];
            if (!res) {
                res = this.textureMap[name];
            }
            if (!res) {
                var prefix = RES.AnalyzerBase.getStringPrefix(name);
                res = this.fileDic[prefix];
                if (res) {
                    var tail = RES.AnalyzerBase.getStringTail(name);
                    res = res.getTexture(tail);
                }
            }
            return res;
        };
        /**
         * 一项加载结束
         */
        SheetAnalyzer.prototype.onLoadFinish = function (event) {
            var loader = (event.target);
            var data = this.resItemDic[loader.hashCode];
            delete this.resItemDic[loader.hashCode];
            this.recycler.push(loader);
            var resItem = data.item;
            var compFunc = data.func;
            resItem.loaded = (event.type == egret.Event.COMPLETE);
            if (resItem.loaded) {
                this.analyzeData(resItem, loader.data);
            }
            if (typeof (loader.data) == "string") {
                this._dataFormat = egret.URLLoaderDataFormat.TEXTURE;
                this.loadFile(resItem, compFunc, data.thisObject);
                this._dataFormat = egret.URLLoaderDataFormat.TEXT;
            }
            else {
                compFunc.call(data.thisObject, resItem);
            }
        };
        /**
         * 解析并缓存加载成功的数据
         */
        SheetAnalyzer.prototype.analyzeData = function (resItem, data) {
            var name = resItem.name;
            if (this.fileDic[name] || !data) {
                return;
            }
            var config;
            if (typeof (data) == "string") {
                try {
                    var str = data;
                    config = JSON.parse(str);
                }
                catch (e) {
                    egret.Logger.warning("JSON文件格式不正确: " + resItem.url);
                }
                if (!config) {
                    return;
                }
                this.sheetMap[name] = config;
                resItem.loaded = false;
                resItem.url = this.getRelativePath(resItem.url, config["file"]);
            }
            else {
                var texture = data;
                config = this.sheetMap[name];
                delete this.sheetMap[name];
                if (texture) {
                    var targetName = resItem.data && resItem.data.subkeys ? "" : name;
                    var spriteSheet = this.parseSpriteSheet(texture, config, targetName);
                    this.fileDic[name] = spriteSheet;
                }
            }
        };
        SheetAnalyzer.prototype.getRelativePath = function (url, file) {
            url = url.split("\\").join("/");
            var index = url.lastIndexOf("/");
            if (index != -1) {
                url = url.substring(0, index + 1) + file;
            }
            else {
                url = file;
            }
            return url;
        };
        SheetAnalyzer.prototype.parseSpriteSheet = function (texture, data, name) {
            var frames = data.frames;
            if (!frames) {
                return null;
            }
            var spriteSheet = new egret.SpriteSheet(texture);
            var textureMap = this.textureMap;
            for (var subkey in frames) {
                var config = frames[subkey];
                var texture = spriteSheet.createTexture(subkey, config.x, config.y, config.w, config.h, config.offX, config.offY, config.sourceW, config.sourceH);
                if (config["scale9grid"]) {
                    var str = config["scale9grid"];
                    var list = str.split(",");
                    texture["scale9Grid"] = new egret.Rectangle(parseInt(list[0]), parseInt(list[1]), parseInt(list[2]), parseInt(list[3]));
                }
                if (textureMap[subkey] == null) {
                    textureMap[subkey] = texture;
                    if (name) {
                        this.addSubkey(subkey, name);
                    }
                }
            }
            return spriteSheet;
        };
        return SheetAnalyzer;
    })(RES.BinAnalyzer);
    RES.SheetAnalyzer = SheetAnalyzer;
    SheetAnalyzer.prototype.__class__ = "RES.SheetAnalyzer";
})(RES || (RES = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var RES;
(function (RES) {
    var FontAnalyzer = (function (_super) {
        __extends(FontAnalyzer, _super);
        function FontAnalyzer() {
            _super.call(this);
        }
        /**
         * 解析并缓存加载成功的数据
         */
        FontAnalyzer.prototype.analyzeData = function (resItem, data) {
            var name = resItem.name;
            if (this.fileDic[name] || !data) {
                return;
            }
            var config;
            if (typeof (data) == "string") {
                config = data;
                this.sheetMap[name] = config;
                resItem.loaded = false;
                resItem.url = this.getTexturePath(resItem.url, config);
            }
            else {
                var texture = data;
                config = this.sheetMap[name];
                delete this.sheetMap[name];
                if (texture) {
                    var spriteSheet = new egret.BitmapTextSpriteSheet(texture, config);
                    this.fileDic[name] = spriteSheet;
                }
            }
        };
        FontAnalyzer.prototype.getTexturePath = function (url, fntText) {
            var file = "";
            var lines = fntText.split("\n");
            var pngLine = lines[2];
            var index = pngLine.indexOf("file=\"");
            if (index != -1) {
                pngLine = pngLine.substring(index + 6);
                index = pngLine.indexOf("\"");
                file = pngLine.substring(0, index);
            }
            url = url.split("\\").join("/");
            var index = url.lastIndexOf("/");
            if (index != -1) {
                url = url.substring(0, index + 1) + file;
            }
            else {
                url = file;
            }
            return url;
        };
        return FontAnalyzer;
    })(RES.SheetAnalyzer);
    RES.FontAnalyzer = FontAnalyzer;
    FontAnalyzer.prototype.__class__ = "RES.FontAnalyzer";
})(RES || (RES = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var RES;
(function (RES) {
    var SoundAnalyzer = (function (_super) {
        __extends(SoundAnalyzer, _super);
        function SoundAnalyzer() {
            _super.call(this);
            this._dataFormat = egret.URLLoaderDataFormat.SOUND;
        }
        SoundAnalyzer.prototype.analyzeData = function (resItem, data) {
            var name = resItem.name;
            if (this.fileDic[name] || !data) {
                return;
            }
            this.fileDic[name] = data;
            var config = resItem.data;
            if (config && config["soundType"]) {
                data.preload(config.soundType);
            }
            else {
                data.preload(egret.Sound.EFFECT);
            }
        };
        return SoundAnalyzer;
    })(RES.BinAnalyzer);
    RES.SoundAnalyzer = SoundAnalyzer;
    SoundAnalyzer.prototype.__class__ = "RES.SoundAnalyzer";
})(RES || (RES = {}));

/**
 * Copyright (c) Egret-Labs.org. Permission is hereby granted, free of charge,
 * to any person obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish, distribute,
 * sublicense, and/or sell copies of the Software, and to permit persons to whom
 * the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
 * PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
 * FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var RES;
(function (RES) {
    var XMLAnalyzer = (function (_super) {
        __extends(XMLAnalyzer, _super);
        function XMLAnalyzer() {
            _super.call(this);
            this._dataFormat = egret.URLLoaderDataFormat.TEXT;
        }
        /**
         * 解析并缓存加载成功的数据
         */
        XMLAnalyzer.prototype.analyzeData = function (resItem, data) {
            var name = resItem.name;
            if (this.fileDic[name] || !data) {
                return;
            }
            try {
                var xmlStr = data;
                var xml = egret.XML.parse(xmlStr);
                this.fileDic[name] = xml;
            }
            catch (e) {
            }
        };
        return XMLAnalyzer;
    })(RES.BinAnalyzer);
    RES.XMLAnalyzer = XMLAnalyzer;
    XMLAnalyzer.prototype.__class__ = "RES.XMLAnalyzer";
})(RES || (RES = {}));

/**
 * Copyright (c) Egret-Labs.org. Permission is hereby granted, free of charge,
 * to any person obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish, distribute,
 * sublicense, and/or sell copies of the Software, and to permit persons to whom
 * the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
 * PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
 * FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var RES;
(function (RES) {
    /**
     * 加载配置文件并解析
     * @method RES.loadConfig
     * @param url {string} 配置文件路径(resource.json的路径)
     * @param resourceRoot {string} 资源根路径。配置中的所有url都是这个路径的相对值。最终url是这个字符串与配置里资源项的url相加的值。
     * @param type {string} 配置文件的格式。确定要用什么解析器来解析配置文件。默认"json"
     */
    function loadConfig(url, resourceRoot, type) {
        if (resourceRoot === void 0) { resourceRoot = ""; }
        if (type === void 0) { type = "json"; }
        instance.loadConfig(url, resourceRoot, type);
    }
    RES.loadConfig = loadConfig;
    /**
     * 根据组名加载一组资源
     * @method RES.loadGroup
     * @param name {string} 要加载资源组的组名
     * @param priority {number} 加载优先级,可以为负数,默认值为0。
     * 低优先级的组必须等待高优先级组完全加载结束才能开始，同一优先级的组会同时加载。
     */
    function loadGroup(name, priority) {
        if (priority === void 0) { priority = 0; }
        instance.loadGroup(name, priority);
    }
    RES.loadGroup = loadGroup;
    /**
     * 检查某个资源组是否已经加载完成
     * @method RES.isGroupLoaded
     * @param name {string} 组名
     * @returns {boolean}
     */
    function isGroupLoaded(name) {
        return instance.isGroupLoaded(name);
    }
    RES.isGroupLoaded = isGroupLoaded;
    /**
     * 根据组名获取组加载项列表
     * @method RES.getGroupByName
     * @param name {string} 组名
     * @returns {egret.ResourceItem}
     */
    function getGroupByName(name) {
        return instance.getGroupByName(name);
    }
    RES.getGroupByName = getGroupByName;
    /**
     * 创建自定义的加载资源组,注意：此方法仅在资源配置文件加载完成后执行才有效。
     * 可以监听ResourceEvent.CONFIG_COMPLETE事件来确认配置加载完成。
     * @method RES.createGroup
     * @param name {string} 要创建的加载资源组的组名
     * @param keys {egret.Array<string>} 要包含的键名列表，key对应配置文件里的name属性或sbuKeys属性的一项或一个资源组名。
     * @param override {boolean} 是否覆盖已经存在的同名资源组,默认false。
     * @returns {boolean}
     */
    function createGroup(name, keys, override) {
        if (override === void 0) { override = false; }
        return instance.createGroup(name, keys, override);
    }
    RES.createGroup = createGroup;
    /**
     * 检查配置文件里是否含有指定的资源
     * @method RES.hasRes
     * @param key {string} 对应配置文件里的name属性或sbuKeys属性的一项。
     * @returns {boolean}
     */
    function hasRes(key) {
        return instance.hasRes(key);
    }
    RES.hasRes = hasRes;
    /**
     * 同步方式获取缓存的已经加载成功的资源。<br/>
     * @method RES.getRes
     * @param key {string} 对应配置文件里的name属性或sbuKeys属性的一项。
     * @returns {any}
     */
    function getRes(key) {
        return instance.getRes(key);
    }
    RES.getRes = getRes;
    /**
     * 异步方式获取配置里的资源。只要是配置文件里存在的资源，都可以通过异步方式获取。
     * @method RES.getResAsync
     * @param key {string} 对应配置文件里的name属性或sbuKeys属性的一项。
     * @param compFunc {Function} 回调函数。示例：compFunc(data,key):void。
     * @param thisObject {any} 回调函数的this引用
     */
    function getResAsync(key, compFunc, thisObject) {
        instance.getResAsync(key, compFunc, thisObject);
    }
    RES.getResAsync = getResAsync;
    /**
     * 通过完整URL方式获取外部资源。
     * @method RES.getResByUrl
     * @param url {string} 要加载文件的外部路径。
     * @param compFunc {Function} 回调函数。示例：compFunc(data,url):void。
     * @param thisObject {any} 回调函数的this引用
     * @param type {string} 文件类型(可选)。请使用ResourceItem类中定义的静态常量。若不设置将根据文件扩展名生成。
     */
    function getResByUrl(url, compFunc, thisObject, type) {
        if (type === void 0) { type = ""; }
        instance.getResByUrl(url, compFunc, thisObject, type);
    }
    RES.getResByUrl = getResByUrl;
    /**
     * 销毁单个资源文件或一组资源的缓存数据,返回是否删除成功。
     * @method RES.destroyRes
     * @param name {string} 配置文件中加载项的name属性或资源组名
     * @returns {boolean}
     */
    function destroyRes(name) {
        return instance.destroyRes(name);
    }
    RES.destroyRes = destroyRes;
    /**
     * 设置最大并发加载线程数量，默认值是2.
     * @method RES.setMaxLoadingThread
     * @param thread {number} 要设置的并发加载数。
     */
    function setMaxLoadingThread(thread) {
        instance.setMaxLoadingThread(thread);
    }
    RES.setMaxLoadingThread = setMaxLoadingThread;
    /**
     * 添加事件侦听器,参考ResourceEvent定义的常量。
     * @method RES.addEventListener
     * @param type {string} 事件的类型。
     * @param listener {Function} 处理事件的侦听器函数。此函数必须接受 Event 对象作为其唯一的参数，并且不能返回任何结果，
     * 如下面的示例所示： function(evt:Event):void 函数可以有任何名称。
     * @param thisObject {any} 侦听函数绑定的this对象
     * @param useCapture {boolean} 确定侦听器是运行于捕获阶段还是运行于目标和冒泡阶段。如果将 useCapture 设置为 true，
     * 则侦听器只在捕获阶段处理事件，而不在目标或冒泡阶段处理事件。如果 useCapture 为 false，则侦听器只在目标或冒泡阶段处理事件。
     * 要在所有三个阶段都侦听事件，请调用 addEventListener 两次：一次将 useCapture 设置为 true，一次将 useCapture 设置为 false。
     * @param priority {number} 事件侦听器的优先级。优先级由一个带符号的 32 位整数指定。数字越大，优先级越高。优先级为 n 的所有侦听器会在
     * 优先级为 n -1 的侦听器之前得到处理。如果两个或更多个侦听器共享相同的优先级，则按照它们的添加顺序进行处理。默认优先级为 0。
     */
    function addEventListener(type, listener, thisObject, useCapture, priority) {
        if (useCapture === void 0) { useCapture = false; }
        if (priority === void 0) { priority = 0; }
        instance.addEventListener(type, listener, thisObject, useCapture, priority);
    }
    RES.addEventListener = addEventListener;
    /**
     * 移除事件侦听器,参考ResourceEvent定义的常量。
     * @method RES.removeEventListener
     * @param type {string} 事件名
     * @param listener {Function} 侦听函数
     * @param thisObject {any} 侦听函数绑定的this对象
     * @param useCapture {boolean} 是否使用捕获，这个属性只在显示列表中生效。
     */
    function removeEventListener(type, listener, thisObject, useCapture) {
        if (useCapture === void 0) { useCapture = false; }
        instance.removeEventListener(type, listener, thisObject, useCapture);
    }
    RES.removeEventListener = removeEventListener;
    var Resource = (function (_super) {
        __extends(Resource, _super);
        /**
         * 构造函数
         * @method RES.constructor
         */
        function Resource() {
            _super.call(this);
            /**
             * 解析器字典
             */
            this.analyzerDic = {};
            this.configItemList = [];
            this.callLaterFlag = false;
            /**
             * 配置文件加载解析完成标志
             */
            this.configComplete = false;
            /**
             * 已经加载过组名列表
             */
            this.loadedGroups = [];
            this.groupNameList = [];
            /**
             * 异步获取资源参数缓存字典
             */
            this.asyncDic = {};
            this.init();
        }
        /**
         * 根据type获取对应的文件解析库
         */
        Resource.prototype.getAnalyzerByType = function (type) {
            var analyzer = this.analyzerDic[type];
            if (!analyzer) {
                analyzer = this.analyzerDic[type] = egret.Injector.getInstance(RES.AnalyzerBase, type);
            }
            return analyzer;
        };
        /**
         * 初始化
         */
        Resource.prototype.init = function () {
            if (!egret.Injector.hasMapRule(RES.AnalyzerBase, RES.ResourceItem.TYPE_BIN))
                egret.Injector.mapClass(RES.AnalyzerBase, RES.BinAnalyzer, RES.ResourceItem.TYPE_BIN);
            if (!egret.Injector.hasMapRule(RES.AnalyzerBase, RES.ResourceItem.TYPE_IMAGE))
                egret.Injector.mapClass(RES.AnalyzerBase, RES.ImageAnalyzer, RES.ResourceItem.TYPE_IMAGE);
            if (!egret.Injector.hasMapRule(RES.AnalyzerBase, RES.ResourceItem.TYPE_TEXT))
                egret.Injector.mapClass(RES.AnalyzerBase, RES.TextAnalyzer, RES.ResourceItem.TYPE_TEXT);
            if (!egret.Injector.hasMapRule(RES.AnalyzerBase, RES.ResourceItem.TYPE_JSON))
                egret.Injector.mapClass(RES.AnalyzerBase, RES.JsonAnalyzer, RES.ResourceItem.TYPE_JSON);
            if (!egret.Injector.hasMapRule(RES.AnalyzerBase, RES.ResourceItem.TYPE_SHEET))
                egret.Injector.mapClass(RES.AnalyzerBase, RES.SheetAnalyzer, RES.ResourceItem.TYPE_SHEET);
            if (!egret.Injector.hasMapRule(RES.AnalyzerBase, RES.ResourceItem.TYPE_FONT))
                egret.Injector.mapClass(RES.AnalyzerBase, RES.FontAnalyzer, RES.ResourceItem.TYPE_FONT);
            if (!egret.Injector.hasMapRule(RES.AnalyzerBase, RES.ResourceItem.TYPE_SOUND))
                egret.Injector.mapClass(RES.AnalyzerBase, RES.SoundAnalyzer, RES.ResourceItem.TYPE_SOUND);
            if (!egret.Injector.hasMapRule(RES.AnalyzerBase, RES.ResourceItem.TYPE_XML))
                egret.Injector.mapClass(RES.AnalyzerBase, RES.XMLAnalyzer, RES.ResourceItem.TYPE_XML);
            this.resConfig = new RES.ResourceConfig();
            this.resLoader = new RES.ResourceLoader();
            this.resLoader.callBack = this.onResourceItemComp;
            this.resLoader.resInstance = this;
            this.resLoader.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onGroupComp, this);
        };
        /**
         * 开始加载配置
         * @method RES.loadConfig
         * @param url {string}
         * @param resourceRoot {string}
         * @param type {string}
         */
        Resource.prototype.loadConfig = function (url, resourceRoot, type) {
            if (type === void 0) { type = "json"; }
            var configItem = { url: url, resourceRoot: resourceRoot, type: type };
            this.configItemList.push(configItem);
            if (!this.callLaterFlag) {
                egret.callLater(this.startLoadConfig, this);
                this.callLaterFlag = true;
            }
        };
        Resource.prototype.startLoadConfig = function () {
            this.callLaterFlag = false;
            var configList = this.configItemList;
            this.configItemList = [];
            this.loadingConfigList = configList;
            var length = configList.length;
            var itemList = [];
            for (var i = 0; i < length; i++) {
                var item = configList[i];
                var resItem = new RES.ResourceItem(item.url, item.url, item.type);
                itemList.push(resItem);
            }
            this.resLoader.loadGroup(itemList, Resource.GROUP_CONFIG, Number.MAX_VALUE);
        };
        /**
         * 检查某个资源组是否已经加载完成
         * @method RES.isGroupLoaded
         * @param name {string}
         * @returns {boolean}
         */
        Resource.prototype.isGroupLoaded = function (name) {
            return this.loadedGroups.indexOf(name) != -1;
        };
        /**
         * 根据组名获取组加载项列表
         * @method RES.getGroupByName
         * @param name {string}
         * @returns {Array<egret.ResourceItem>}
         */
        Resource.prototype.getGroupByName = function (name) {
            return this.resConfig.getGroupByName(name);
        };
        /**
         * 根据组名加载一组资源
         * @method RES.loadGroup
         * @param name {string}
         * @param priority {number}
         */
        Resource.prototype.loadGroup = function (name, priority) {
            if (priority === void 0) { priority = 0; }
            if (this.loadedGroups.indexOf(name) != -1 || this.resLoader.isGroupInLoading(name))
                return;
            if (this.configComplete) {
                var group = this.resConfig.getGroupByName(name);
                this.resLoader.loadGroup(group, name, priority);
            }
            else {
                this.groupNameList.push({ name: name, priority: priority });
            }
        };
        /**
         * 创建自定义的加载资源组,注意：此方法仅在资源配置文件加载完成后执行才有效。
         * 可以监听ResourceEvent.CONFIG_COMPLETE事件来确认配置加载完成。
         * @method RES.ResourceConfig#createGroup
         * @param name {string} 要创建的加载资源组的组名
         * @param keys {egret.Array<string>} 要包含的键名列表，key对应配置文件里的name属性或一个资源组名。
         * @param override {boolean} 是否覆盖已经存在的同名资源组,默认false。
         * @returns {boolean}
         */
        Resource.prototype.createGroup = function (name, keys, override) {
            if (override === void 0) { override = false; }
            if (override) {
                var index = this.loadedGroups.indexOf(name);
                if (index != -1) {
                    this.loadedGroups.splice(index, 1);
                }
            }
            return this.resConfig.createGroup(name, keys, override);
        };
        /**
         * 队列加载完成事件
         */
        Resource.prototype.onGroupComp = function (event) {
            if (event.groupName == Resource.GROUP_CONFIG) {
                var length = this.loadingConfigList.length;
                for (var i = 0; i < length; i++) {
                    var config = this.loadingConfigList[i];
                    var resolver = this.getAnalyzerByType(config.type);
                    var data = resolver.getRes(config.url);
                    resolver.destroyRes(config.url);
                    this.resConfig.parseConfig(data, config.resourceRoot);
                }
                this.configComplete = true;
                this.loadingConfigList = null;
                RES.ResourceEvent.dispatchResourceEvent(this, RES.ResourceEvent.CONFIG_COMPLETE);
                var groupNameList = this.groupNameList;
                var length = groupNameList.length;
                for (var i = 0; i < length; i++) {
                    var item = groupNameList[i];
                    this.loadGroup(item.name, item.priority);
                }
                this.groupNameList = [];
            }
            else {
                this.loadedGroups.push(event.groupName);
                this.dispatchEvent(event);
            }
        };
        /**
         * 检查配置文件里是否含有指定的资源
         * @method RES.hasRes
         * @param key {string} 对应配置文件里的name属性或sbuKeys属性的一项。
         * @returns {boolean}
         */
        Resource.prototype.hasRes = function (key) {
            var type = this.resConfig.getType(key);
            if (type == "") {
                var prefix = RES.AnalyzerBase.getStringPrefix(key);
                type = this.resConfig.getType(prefix);
                if (type == "") {
                    return false;
                }
            }
            return true;
        };
        /**
         * 通过key同步获取资源
         * @method RES.getRes
         * @param key {string}
         * @returns {any}
         */
        Resource.prototype.getRes = function (key) {
            var type = this.resConfig.getType(key);
            if (type == "") {
                var prefix = RES.AnalyzerBase.getStringPrefix(key);
                type = this.resConfig.getType(prefix);
                if (type == "") {
                    return null;
                }
            }
            var analyzer = this.getAnalyzerByType(type);
            return analyzer.getRes(key);
        };
        /**
         * 通过key异步获取资源
         * @method RES.getResAsync
         * @param key {string}
         * @param compFunc {Function} 回调函数。示例：compFunc(data,url):void。
         * @param thisObject {any}
         */
        Resource.prototype.getResAsync = function (key, compFunc, thisObject) {
            var type = this.resConfig.getType(key);
            var name = this.resConfig.getName(key);
            if (type == "") {
                name = RES.AnalyzerBase.getStringPrefix(key);
                type = this.resConfig.getType(name);
                if (type == "") {
                    compFunc.call(thisObject, null);
                    return;
                }
            }
            var analyzer = this.getAnalyzerByType(type);
            var res = analyzer.getRes(key);
            if (res) {
                compFunc.call(thisObject, res);
                return;
            }
            var args = { key: key, compFunc: compFunc, thisObject: thisObject };
            if (this.asyncDic[name]) {
                this.asyncDic[name].push(args);
            }
            else {
                this.asyncDic[name] = [args];
                var resItem = this.resConfig.getResourceItem(name);
                this.resLoader.loadItem(resItem);
            }
        };
        /**
         * 通过url获取资源
         * @method RES.getResByUrl
         * @param url {string}
         * @param compFunc {Function}
         * @param thisObject {any}
         * @param type {string}
         */
        Resource.prototype.getResByUrl = function (url, compFunc, thisObject, type) {
            if (type === void 0) { type = ""; }
            if (!url) {
                compFunc.call(thisObject, null);
                return;
            }
            if (!type)
                type = this.getTypeByUrl(url);
            var analyzer = this.getAnalyzerByType(type);
            var name = url;
            var res = analyzer.getRes(name);
            if (res) {
                compFunc.call(thisObject, res);
                return;
            }
            var args = { key: name, compFunc: compFunc, thisObject: thisObject };
            if (this.asyncDic[name]) {
                this.asyncDic[name].push(args);
            }
            else {
                this.asyncDic[name] = [args];
                var resItem = new RES.ResourceItem(name, url, type);
                this.resLoader.loadItem(resItem);
            }
        };
        /**
         * 通过url获取文件类型
         */
        Resource.prototype.getTypeByUrl = function (url) {
            var suffix = url.substr(url.lastIndexOf(".") + 1);
            if (suffix) {
                suffix = suffix.toLowerCase();
            }
            var type;
            switch (suffix) {
                case RES.ResourceItem.TYPE_XML:
                case RES.ResourceItem.TYPE_JSON:
                case RES.ResourceItem.TYPE_SHEET:
                    type = suffix;
                    break;
                case "png":
                case "jpg":
                case "gif":
                    type = RES.ResourceItem.TYPE_IMAGE;
                    break;
                case "fnt":
                    type = RES.ResourceItem.TYPE_FONT;
                    break;
                case "txt":
                    type = RES.ResourceItem.TYPE_TEXT;
                    break;
                case "mp3":
                case "ogg":
                case "mpeg":
                case "wav":
                case "m4a":
                case "mp4":
                case "aiff":
                case "wma":
                case "mid":
                    type = RES.ResourceItem.TYPE_SOUND;
                    break;
                default:
                    type = RES.ResourceItem.TYPE_BIN;
                    break;
            }
            return type;
        };
        /**
         * 一个加载项加载完成
         */
        Resource.prototype.onResourceItemComp = function (item) {
            var argsList = this.asyncDic[item.name];
            delete this.asyncDic[item.name];
            var analyzer = this.getAnalyzerByType(item.type);
            var length = argsList.length;
            for (var i = 0; i < length; i++) {
                var args = argsList[i];
                var res = analyzer.getRes(args.key);
                args.compFunc.call(args.thisObject, res, args.key);
            }
        };
        /**
         * 销毁单个资源文件或一组资源的缓存数据,返回是否删除成功。
         * @method RES.destroyRes
         * @param name {string} 配置文件中加载项的name属性或资源组名
         * @returns {boolean}
         */
        Resource.prototype.destroyRes = function (name) {
            var group = this.resConfig.getRawGroupByName(name);
            if (group) {
                var index = this.loadedGroups.indexOf(name);
                if (index != -1) {
                    this.loadedGroups.splice(index, 1);
                }
                var length = group.length;
                for (var i = 0; i < length; i++) {
                    var item = group[i];
                    item.loaded = false;
                    var analyzer = this.getAnalyzerByType(item.type);
                    analyzer.destroyRes(item.name);
                }
                return true;
            }
            else {
                var type = this.resConfig.getType(name);
                if (type == "")
                    return false;
                item = this.resConfig.getRawResourceItem(name);
                item.loaded = false;
                analyzer = this.getAnalyzerByType(type);
                return analyzer.destroyRes(name);
            }
        };
        /**
         * 设置最大并发加载线程数量，默认值是2.
         * @method RES.setMaxLoadingThread
         * @param thread {number} 要设置的并发加载数。
         */
        Resource.prototype.setMaxLoadingThread = function (thread) {
            if (thread < 1) {
                thread = 1;
            }
            this.resLoader.thread = thread;
        };
        /**
         * 配置文件组组名
         */
        Resource.GROUP_CONFIG = "RES__CONFIG";
        return Resource;
    })(egret.EventDispatcher);
    Resource.prototype.__class__ = "Resource";
    /**
     * Resource单例
     */
    var instance = new Resource();
})(RES || (RES = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var egret;
(function (egret) {
    /**
     * @class egret.HTML5DeviceContext
     * @classdesc
     * @extends egret.DeviceContext
     */
    var HTML5DeviceContext = (function (_super) {
        __extends(HTML5DeviceContext, _super);
        /**
         * @method egret.HTML5DeviceContext#constructor
         */
        function HTML5DeviceContext(frameRate) {
            if (frameRate === void 0) { frameRate = 60; }
            _super.call(this);
            this.frameRate = frameRate;
            this._time = 0;
            this._isActivate = true;
            if (frameRate == 60) {
                HTML5DeviceContext.requestAnimationFrame = window["requestAnimationFrame"] || window["webkitRequestAnimationFrame"] || window["mozRequestAnimationFrame"] || window["oRequestAnimationFrame"] || window["msRequestAnimationFrame"];
                HTML5DeviceContext.cancelAnimationFrame = window["cancelAnimationFrame"] || window["msCancelAnimationFrame"] || window["mozCancelAnimationFrame"] || window["webkitCancelAnimationFrame"] || window["oCancelAnimationFrame"] || window["cancelRequestAnimationFrame"] || window["msCancelRequestAnimationFrame"] || window["mozCancelRequestAnimationFrame"] || window["oCancelRequestAnimationFrame"] || window["webkitCancelRequestAnimationFrame"];
            }
            if (!HTML5DeviceContext.requestAnimationFrame) {
                HTML5DeviceContext.requestAnimationFrame = function (callback) {
                    return window.setTimeout(callback, 1000 / frameRate);
                };
            }
            if (!HTML5DeviceContext.cancelAnimationFrame) {
                HTML5DeviceContext.cancelAnimationFrame = function (id) {
                    return window.clearTimeout(id);
                };
            }
            HTML5DeviceContext.instance = this;
            this.registerListener();
        }
        HTML5DeviceContext.prototype.enterFrame = function () {
            var context = HTML5DeviceContext.instance;
            var thisObject = HTML5DeviceContext._thisObject;
            var callback = HTML5DeviceContext._callback;
            var thisTime = egret.getTimer();
            var advancedTime = thisTime - context._time;
            context._requestAnimationId = HTML5DeviceContext.requestAnimationFrame.call(window, HTML5DeviceContext.prototype.enterFrame);
            callback.call(thisObject, advancedTime);
            context._time = thisTime;
        };
        /**
         * @method egret.HTML5DeviceContext#executeMainLoop
         * @param callback {Function}
         * @param thisObject {any}
         */
        HTML5DeviceContext.prototype.executeMainLoop = function (callback, thisObject) {
            HTML5DeviceContext._callback = callback;
            HTML5DeviceContext._thisObject = thisObject;
            this.enterFrame();
        };
        HTML5DeviceContext.prototype.reset = function () {
            var context = HTML5DeviceContext.instance;
            if (context._requestAnimationId) {
                context._time = egret.getTimer();
                HTML5DeviceContext.cancelAnimationFrame.call(window, context._requestAnimationId);
                context.enterFrame();
            }
        };
        HTML5DeviceContext.prototype.registerListener = function () {
            var self = this;
            //失去焦点
            var onBlurHandler = function () {
                if (!self._isActivate) {
                    return;
                }
                self._isActivate = false;
                egret.MainContext.instance.stage.dispatchEvent(new egret.Event(egret.Event.DEACTIVATE));
            };
            //激活
            var onFocusHandler = function () {
                if (self._isActivate) {
                    return;
                }
                self._isActivate = true;
                var context = HTML5DeviceContext.instance;
                context.reset();
                egret.MainContext.instance.stage.dispatchEvent(new egret.Event(egret.Event.ACTIVATE));
            };
            var handleVisibilityChange = function () {
                if (!document[hidden]) {
                    onFocusHandler();
                }
                else {
                    onBlurHandler();
                }
            };
            //            window.onfocus = onFocusHandler;
            //            window.onblur = onBlurHandler;
            window.addEventListener("focus", onFocusHandler, false);
            window.addEventListener("blur", onBlurHandler, false);
            var hidden, visibilityChange;
            if (typeof document.hidden !== "undefined") {
                hidden = "hidden";
                visibilityChange = "visibilitychange";
            }
            else if (typeof document["mozHidden"] !== "undefined") {
                hidden = "mozHidden";
                visibilityChange = "mozvisibilitychange";
            }
            else if (typeof document["msHidden"] !== "undefined") {
                hidden = "msHidden";
                visibilityChange = "msvisibilitychange";
            }
            else if (typeof document["webkitHidden"] !== "undefined") {
                hidden = "webkitHidden";
                visibilityChange = "webkitvisibilitychange";
            }
            else if (typeof document["oHidden"] !== "undefined") {
                hidden = "oHidden";
                visibilityChange = "ovisibilitychange";
            }
            if ("onpageshow" in window && "onpagehide" in window) {
                window.addEventListener("pageshow", onFocusHandler, false);
                window.addEventListener("pagehide", onBlurHandler, false);
            }
            if (hidden && visibilityChange) {
                document.addEventListener(visibilityChange, handleVisibilityChange, false);
            }
        };
        return HTML5DeviceContext;
    })(egret.DeviceContext);
    egret.HTML5DeviceContext = HTML5DeviceContext;
    HTML5DeviceContext.prototype.__class__ = "egret.HTML5DeviceContext";
})(egret || (egret = {}));
var egret_html5_localStorage;
(function (egret_html5_localStorage) {
    //todo 有可能没有window.localStorage对象
    function getItem(key) {
        return window.localStorage.getItem(key);
    }
    egret_html5_localStorage.getItem = getItem;
    function setItem(key, value) {
        try {
            window.localStorage.setItem(key, value);
            return true;
        }
        catch (e) {
            console.log("egret_html5_localStorage.setItem保存失败,key=" + key + "&value=" + value);
            return false;
        }
    }
    egret_html5_localStorage.setItem = setItem;
    function removeItem(key) {
        window.localStorage.removeItem(key);
    }
    egret_html5_localStorage.removeItem = removeItem;
    function clear() {
        window.localStorage.clear();
    }
    egret_html5_localStorage.clear = clear;
    function init() {
        for (var key in egret_html5_localStorage) {
            egret.localStorage[key] = egret_html5_localStorage[key];
        }
    }
    egret_html5_localStorage.init = init;
})(egret_html5_localStorage || (egret_html5_localStorage = {}));
egret_html5_localStorage.init();

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var egret;
(function (egret) {
    /**
     * @class egret.HTML5CanvasRenderer
     * @classdesc
     * @extends egret.RendererContext
     */
    var HTML5CanvasRenderer = (function (_super) {
        __extends(HTML5CanvasRenderer, _super);
        function HTML5CanvasRenderer(canvas) {
            _super.call(this);
            this.globalAlpha = 1;
            this.canvas = canvas || this.createCanvas();
            this.canvasContext = this.canvas.getContext("2d");
            this._cacheCanvas = document.createElement("canvas");
            this._cacheCanvas.width = this.canvas.width;
            this._cacheCanvas.height = this.canvas.height;
            this._cacheCanvasContext = this._cacheCanvas.getContext("2d");
            this._cacheCanvasContext["imageSmoothingEnabled"] = egret.RendererContext.imageSmoothingEnabled;
            this._cacheCanvasContext["webkitImageSmoothingEnabled"] = egret.RendererContext.imageSmoothingEnabled;
            this._cacheCanvasContext["mozImageSmoothingEnabled"] = egret.RendererContext.imageSmoothingEnabled;
            this._cacheCanvasContext["msImageSmoothingEnabled"] = egret.RendererContext.imageSmoothingEnabled;
            var f = this.canvasContext.setTransform;
            var that = this;
            this._cacheCanvasContext.setTransform = function (a, b, c, d, tx, ty) {
                that._matrixA = a;
                that._matrixB = b;
                that._matrixC = c;
                that._matrixD = d;
                that._matrixTx = tx;
                that._matrixTy = ty;
                f.call(that._cacheCanvasContext, a, b, c, d, tx, ty);
            };
            this._matrixA = 1;
            this._matrixB = 0;
            this._matrixC = 0;
            this._matrixD = 1;
            this._matrixTx = 0;
            this._matrixTy = 0;
            this._transformTx = 0;
            this._transformTy = 0;
            this.initBlendMode();
        }
        HTML5CanvasRenderer.prototype.createCanvas = function () {
            var canvas = egret.Browser.getInstance().$("#egretCanvas");
            if (!canvas) {
                var container = document.getElementById(egret.StageDelegate.canvas_div_name);
                canvas = egret.Browser.getInstance().$new("canvas");
                canvas.id = "egretCanvas";
                canvas.width = egret.MainContext.instance.stage.stageWidth; //stageW
                canvas.height = egret.MainContext.instance.stage.stageHeight; //stageH
                canvas.style.width = container.style.width;
                canvas.style.height = container.style.height;
                //                canvas.style.position = "absolute";
                container.appendChild(canvas);
            }
            return canvas;
        };
        HTML5CanvasRenderer.prototype.clearScreen = function () {
            var list = egret.RenderFilter.getInstance().getDrawAreaList();
            for (var i = 0, l = list.length; i < l; i++) {
                var area = list[i];
                this.clearRect(area.x, area.y, area.width, area.height);
            }
            var stage = egret.MainContext.instance.stage;
            this._cacheCanvasContext.clearRect(0, 0, stage.stageWidth, stage.stageHeight);
            this.renderCost = 0;
        };
        HTML5CanvasRenderer.prototype.clearRect = function (x, y, w, h) {
            //            this.canvasContext.fillRect(x, y, w, h);
            this.canvasContext.clearRect(x, y, w, h);
        };
        HTML5CanvasRenderer.prototype.drawImage = function (texture, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight, repeat) {
            if (repeat === void 0) { repeat = undefined; }
            var scale = egret.MainContext.instance.rendererContext.texture_scale_factor;
            sourceX = sourceX / scale;
            sourceY = sourceY / scale;
            sourceWidth = sourceWidth / scale;
            sourceHeight = sourceHeight / scale;
            //            if (DEBUG && DEBUG.DRAW_IMAGE) {
            //                DEBUG.checkDrawImage(texture, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight);
            //            }
            var image = texture._bitmapData;
            destX += this._transformTx;
            destY += this._transformTy;
            var beforeDraw = egret.getTimer();
            if (repeat === undefined) {
                this._cacheCanvasContext.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight);
            }
            else {
                this.drawRepeatImage(texture, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight, repeat);
            }
            _super.prototype.drawImage.call(this, texture, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight, repeat);
            this.renderCost += egret.getTimer() - beforeDraw;
        };
        HTML5CanvasRenderer.prototype.drawRepeatImage = function (texture, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight, repeat) {
            if (texture['pattern'] === undefined) {
                var image = texture._bitmapData;
                var tempImage = image;
                if (image.width != sourceWidth || image.height != sourceHeight) {
                    var tempCanvas = document.createElement("canvas");
                    tempCanvas.width = sourceWidth;
                    tempCanvas.height = sourceHeight;
                    tempCanvas.getContext("2d").drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, sourceWidth, sourceHeight);
                    tempImage = tempCanvas;
                }
                var pat = this._cacheCanvasContext.createPattern(tempImage, repeat);
                texture['pattern'] = pat;
            }
            var pattern = texture['pattern'];
            this._cacheCanvasContext.fillStyle = pattern;
            this._cacheCanvasContext.translate(destX, destY);
            this._cacheCanvasContext.fillRect(0, 0, destWidth, destHeight);
            this._cacheCanvasContext.translate(-destX, -destY);
        };
        HTML5CanvasRenderer.prototype.setTransform = function (matrix) {
            //在没有旋转缩放斜切的情况下，先不进行矩阵偏移，等下次绘制的时候偏移
            if (matrix.a == 1 && matrix.b == 0 && matrix.c == 0 && matrix.d == 1 && this._matrixA == 1 && this._matrixB == 0 && this._matrixC == 0 && this._matrixD == 1) {
                this._transformTx = matrix.tx - this._matrixTx;
                this._transformTy = matrix.ty - this._matrixTy;
                return;
            }
            this._transformTx = this._transformTy = 0;
            if (this._matrixA != matrix.a || this._matrixB != matrix.b || this._matrixC != matrix.c || this._matrixD != matrix.d || this._matrixTx != matrix.tx || this._matrixTy != matrix.ty) {
                this._cacheCanvasContext.setTransform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty);
            }
        };
        HTML5CanvasRenderer.prototype.setAlpha = function (alpha, blendMode) {
            if (alpha != this.globalAlpha) {
                this._cacheCanvasContext.globalAlpha = this.globalAlpha = alpha;
            }
            if (blendMode) {
                this.blendValue = this.blendModes[blendMode];
                this._cacheCanvasContext.globalCompositeOperation = this.blendValue;
            }
            else if (this.blendValue != egret.BlendMode.NORMAL) {
                this.blendValue = this.blendModes[egret.BlendMode.NORMAL];
                this._cacheCanvasContext.globalCompositeOperation = this.blendValue;
            }
        };
        HTML5CanvasRenderer.prototype.initBlendMode = function () {
            this.blendModes = {};
            this.blendModes[egret.BlendMode.NORMAL] = "source-over";
            this.blendModes[egret.BlendMode.ADD] = "lighter";
        };
        HTML5CanvasRenderer.prototype.setupFont = function (textField) {
            var ctx = this._cacheCanvasContext;
            var font = textField._italic ? "italic " : "normal ";
            font += textField._bold ? "bold " : "normal ";
            font += textField._size + "px " + textField._fontFamily;
            ctx.font = font;
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
        };
        HTML5CanvasRenderer.prototype.measureText = function (text) {
            var result = this._cacheCanvasContext.measureText(text);
            return result.width;
        };
        HTML5CanvasRenderer.prototype.drawText = function (textField, text, x, y, maxWidth, style) {
            var textColor;
            if (style["textColor"]) {
                textColor = egret.toColorString(parseInt(style["textColor"]));
            }
            else {
                textColor = textField._textColorString;
            }
            var strokeColor;
            if (style["strokeColor"]) {
                strokeColor = egret.toColorString(style["strokeColor"]);
            }
            else {
                strokeColor = textField._strokeColorString;
            }
            var outline;
            if (style["outline"]) {
                outline = style["outline"];
            }
            else {
                outline = textField._stroke;
            }
            var renderContext = this._cacheCanvasContext;
            renderContext.fillStyle = textColor;
            renderContext.strokeStyle = strokeColor;
            if (outline) {
                renderContext.lineWidth = outline * 2;
                renderContext.strokeText(text, x + this._transformTx, y + this._transformTy, maxWidth || 0xFFFF);
            }
            renderContext.fillText(text, x + this._transformTx, y + this._transformTy, maxWidth || 0xFFFF);
            _super.prototype.drawText.call(this, textField, text, x, y, maxWidth, style);
        };
        HTML5CanvasRenderer.prototype.strokeRect = function (x, y, w, h, color) {
            this._cacheCanvasContext.strokeStyle = color;
            this._cacheCanvasContext.strokeRect(x, y, w, h);
        };
        HTML5CanvasRenderer.prototype.pushMask = function (mask) {
            this._cacheCanvasContext.save();
            this._cacheCanvasContext.beginPath();
            this._cacheCanvasContext.rect(mask.x + this._transformTx, mask.y + this._transformTy, mask.width, mask.height);
            this._cacheCanvasContext.clip();
            this._cacheCanvasContext.closePath();
        };
        HTML5CanvasRenderer.prototype.popMask = function () {
            this._cacheCanvasContext.restore();
            this._cacheCanvasContext.setTransform(1, 0, 0, 1, 0, 0);
        };
        HTML5CanvasRenderer.prototype.onRenderStart = function () {
            this._cacheCanvasContext.save();
        };
        HTML5CanvasRenderer.prototype.onRenderFinish = function () {
            this._cacheCanvasContext.restore();
            this._cacheCanvasContext.setTransform(1, 0, 0, 1, 0, 0);
            var list = egret.RenderFilter.getInstance().getDrawAreaList();
            for (var i = 0, l = list.length; i < l; i++) {
                var area = list[i];
                this.canvasContext.drawImage(this._cacheCanvas, area.x, area.y, area.width, area.height, area.x, area.y, area.width, area.height);
            }
        };
        return HTML5CanvasRenderer;
    })(egret.RendererContext);
    egret.HTML5CanvasRenderer = HTML5CanvasRenderer;
    HTML5CanvasRenderer.prototype.__class__ = "egret.HTML5CanvasRenderer";
})(egret || (egret = {}));
var egret_h5_graphics;
(function (egret_h5_graphics) {
    function beginFill(color, alpha) {
        if (alpha === void 0) { alpha = 1; }
        var _colorBlue = color & 0x0000FF;
        var _colorGreen = (color & 0x00ff00) >> 8;
        var _colorRed = color >> 16;
        var _colorStr = "rgba(" + _colorRed + "," + _colorGreen + "," + _colorBlue + "," + alpha + ")";
        this.fillStyleColor = _colorStr;
        this.commandQueue.push(new Command(this._setStyle, this, [_colorStr]));
    }
    egret_h5_graphics.beginFill = beginFill;
    function drawRect(x, y, width, height) {
        this.commandQueue.push(new Command(function (x, y, width, height) {
            var rendererContext = this.renderContext;
            this.canvasContext.beginPath();
            this.canvasContext.rect(rendererContext._transformTx + x, rendererContext._transformTy + y, width, height);
            this.canvasContext.closePath();
        }, this, [x, y, width, height]));
        this._fill();
    }
    egret_h5_graphics.drawRect = drawRect;
    function drawCircle(x, y, r) {
        this.commandQueue.push(new Command(function (x, y, r) {
            var rendererContext = this.renderContext;
            this.canvasContext.beginPath();
            this.canvasContext.arc(rendererContext._transformTx + x, rendererContext._transformTy + y, r, 0, Math.PI * 2);
            this.canvasContext.closePath();
        }, this, [x, y, r]));
        this._fill();
    }
    egret_h5_graphics.drawCircle = drawCircle;
    function drawRoundRect(x, y, width, height, ellipseWidth, ellipseHeight) {
        //非等值椭圆角实现
        this.commandQueue.push(new Command(function (x, y, width, height, ellipseWidth, ellipseHeight) {
            var rendererContext = this.renderContext;
            var _x = rendererContext._transformTx + x; //控制X偏移
            var _y = rendererContext._transformTy + y; //控制Y偏移
            var _w = width;
            var _h = height;
            var _ew = ellipseWidth / 2;
            var _eh = ellipseHeight ? ellipseHeight / 2 : _ew;
            var right = _x + _w;
            var bottom = _y + _h;
            var ax = right;
            var ay = bottom - _eh;
            this.canvasContext.beginPath();
            this.canvasContext.moveTo(ax, ay);
            this.canvasContext.quadraticCurveTo(right, bottom, right - _ew, bottom);
            this.canvasContext.lineTo(_x + _ew, bottom);
            this.canvasContext.quadraticCurveTo(_x, bottom, _x, bottom - _eh);
            this.canvasContext.lineTo(_x, _y + _eh);
            this.canvasContext.quadraticCurveTo(_x, _y, _x + _ew, _y);
            this.canvasContext.lineTo(right - _ew, _y);
            this.canvasContext.quadraticCurveTo(right, _y, right, _y + _eh);
            this.canvasContext.lineTo(ax, ay);
            this.canvasContext.closePath();
        }, this, [x, y, width, height, ellipseWidth, ellipseHeight]));
        this._fill();
    }
    egret_h5_graphics.drawRoundRect = drawRoundRect;
    function drawEllipse(x, y, width, height) {
        //基于均匀压缩算法
        this.commandQueue.push(new Command(function (x, y, width, height) {
            var rendererContext = this.renderContext;
            this.canvasContext.save();
            var _x = rendererContext._transformTx + x; //控制X偏移
            var _y = rendererContext._transformTy + y; //控制Y偏移
            var r = (width > height) ? width : height; //选宽高较大者做为arc半径参数
            var ratioX = width / r; //横轴缩放比率
            var ratioY = height / r; //纵轴缩放比率
            this.canvasContext.scale(ratioX, ratioY); //进行缩放(均匀压缩)
            this.canvasContext.beginPath();
            this.canvasContext.moveTo((_x + width) / ratioX, _y / ratioY);
            this.canvasContext.arc(_x / ratioX, _y / ratioY, r, 0, 2 * Math.PI);
            this.canvasContext.closePath();
            this.canvasContext.restore();
            this.canvasContext.stroke();
        }, this, [x, y, width, height]));
        this._fill();
    }
    egret_h5_graphics.drawEllipse = drawEllipse;
    function lineStyle(thickness, color, alpha, pixelHinting, scaleMode, caps, joints, miterLimit) {
        if (thickness === void 0) { thickness = NaN; }
        if (color === void 0) { color = 0; }
        if (alpha === void 0) { alpha = 1.0; }
        if (pixelHinting === void 0) { pixelHinting = false; }
        if (scaleMode === void 0) { scaleMode = "normal"; }
        if (caps === void 0) { caps = null; }
        if (joints === void 0) { joints = null; }
        if (miterLimit === void 0) { miterLimit = 3; }
        if (this.strokeStyleColor) {
            this.createEndLineCommand();
            this.commandQueue.push(this.endLineCommand);
        }
        var _colorBlue = color & 0x0000FF;
        var _colorGreen = (color & 0x00ff00) >> 8;
        var _colorRed = color >> 16;
        var _colorStr = "rgba(" + _colorRed + "," + _colorGreen + "," + _colorBlue + "," + alpha + ")";
        this.strokeStyleColor = _colorStr;
        this.commandQueue.push(new Command(function (lineWidth, strokeStyle) {
            this.canvasContext.lineWidth = lineWidth;
            this.canvasContext.strokeStyle = strokeStyle;
            this.canvasContext.beginPath();
        }, this, [thickness, _colorStr]));
        if (typeof (this.lineX) === "undefined") {
            this.lineX = 0;
            this.lineY = 0;
        }
        this.moveTo(this.lineX, this.lineY);
    }
    egret_h5_graphics.lineStyle = lineStyle;
    function lineTo(x, y) {
        this.commandQueue.push(new Command(function (x, y) {
            var rendererContext = this.renderContext;
            var canvasContext = this.canvasContext;
            canvasContext.lineTo(rendererContext._transformTx + x, rendererContext._transformTy + y);
        }, this, [x, y]));
        this.lineX = x;
        this.lineY = y;
    }
    egret_h5_graphics.lineTo = lineTo;
    function curveTo(controlX, controlY, anchorX, anchorY) {
        this.commandQueue.push(new Command(function (x, y, ax, ay) {
            var rendererContext = this.renderContext;
            var canvasContext = this.canvasContext;
            canvasContext.quadraticCurveTo(rendererContext._transformTx + x, rendererContext._transformTy + y, rendererContext._transformTx + ax, rendererContext._transformTy + ay);
        }, this, [controlX, controlY, anchorX, anchorY]));
        this.lineX = anchorX;
        this.lineY = anchorY;
    }
    egret_h5_graphics.curveTo = curveTo;
    function moveTo(x, y) {
        this.commandQueue.push(new Command(function (x, y) {
            var rendererContext = this.renderContext;
            var canvasContext = this.canvasContext;
            canvasContext.moveTo(rendererContext._transformTx + x, rendererContext._transformTy + y);
        }, this, [x, y]));
    }
    egret_h5_graphics.moveTo = moveTo;
    function clear() {
        this.commandQueue.length = 0;
        this.lineX = 0;
        this.lineY = 0;
        this.strokeStyleColor = null;
        this.fillStyleColor = null;
    }
    egret_h5_graphics.clear = clear;
    function createEndFillCommand() {
        if (!this.endFillCommand) {
            this.endFillCommand = new Command(function () {
                this.canvasContext.fill();
                this.canvasContext.closePath();
            }, this, null);
        }
    }
    egret_h5_graphics.createEndFillCommand = createEndFillCommand;
    function endFill() {
        if (this.fillStyleColor != null) {
            this._fill();
        }
        this.fillStyleColor = null;
    }
    egret_h5_graphics.endFill = endFill;
    function _fill() {
        if (this.fillStyleColor) {
            this.createEndFillCommand();
            this.commandQueue.push(this.endFillCommand);
        }
    }
    egret_h5_graphics._fill = _fill;
    function createEndLineCommand() {
        if (!this.endLineCommand) {
            this.endLineCommand = new Command(function () {
                this.canvasContext.stroke();
                this.canvasContext.closePath();
            }, this, null);
        }
    }
    egret_h5_graphics.createEndLineCommand = createEndLineCommand;
    function _draw(renderContext) {
        var length = this.commandQueue.length;
        if (length == 0) {
            return;
        }
        this.renderContext = renderContext;
        this.canvasContext = this.renderContext._cacheCanvasContext || this.renderContext.canvasContext;
        var canvasContext = this.canvasContext;
        canvasContext.save();
        if (this.strokeStyleColor && length > 0 && this.commandQueue[length - 1] != this.endLineCommand) {
            this.createEndLineCommand();
            this.commandQueue.push(this.endLineCommand);
            length = this.commandQueue.length;
        }
        for (var i = 0; i < length; i++) {
            var command = this.commandQueue[i];
            command.method.apply(command.thisObject, command.args);
        }
        canvasContext.restore();
    }
    egret_h5_graphics._draw = _draw;
    var Command = (function () {
        function Command(method, thisObject, args) {
            this.method = method;
            this.thisObject = thisObject;
            this.args = args;
        }
        return Command;
    })();
    Command.prototype.__class__ = "Command";
    function _setStyle(colorStr) {
        this.canvasContext.fillStyle = colorStr;
        this.canvasContext.beginPath();
    }
    egret_h5_graphics._setStyle = _setStyle;
    function init() {
        for (var key in egret_h5_graphics) {
            egret.Graphics.prototype[key] = egret_h5_graphics[key];
        }
        egret.RendererContext.createRendererContext = function (canvas) {
            return new egret.HTML5CanvasRenderer(canvas);
        };
    }
    egret_h5_graphics.init = init;
})(egret_h5_graphics || (egret_h5_graphics = {}));
egret_h5_graphics.init();

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var egret;
(function (egret) {
    /**
     * @class egret.WebGLRenderer
     * @classdesc
     * @extends egret.RendererContext
     */
    var WebGLRenderer = (function (_super) {
        __extends(WebGLRenderer, _super);
        function WebGLRenderer(canvas) {
            _super.call(this);
            this.size = 2000;
            this.vertSize = 5;
            this.contextLost = false;
            this.glContextId = 0;
            this.currentBlendMode = "";
            this.currentBaseTexture = null;
            this.currentBatchSize = 0;
            this.maskList = [];
            this.maskDataFreeList = [];
            this.canvasContext = document.createElement("canvas").getContext("2d");
            console.log("使用WebGL模式");
            this.canvas = canvas || this.createCanvas();
            this.canvas.addEventListener("webglcontextlost", this.handleContextLost.bind(this), false);
            this.canvas.addEventListener("webglcontextrestored", this.handleContextRestored.bind(this), false);
            this.projectionX = this.canvas.width / 2;
            this.projectionY = -this.canvas.height / 2;
            var numVerts = this.size * 4 * this.vertSize;
            var numIndices = this.size * 6;
            this.vertices = new Float32Array(numVerts);
            this.indices = new Uint16Array(numIndices);
            for (var i = 0, j = 0; i < numIndices; i += 6, j += 4) {
                this.indices[i + 0] = j + 0;
                this.indices[i + 1] = j + 1;
                this.indices[i + 2] = j + 2;
                this.indices[i + 3] = j + 0;
                this.indices[i + 4] = j + 2;
                this.indices[i + 5] = j + 3;
            }
            this.initWebGL();
            this.shaderManager = new egret.WebGLShaderManager(this.gl);
            this.worldTransform = new egret.Matrix();
            this.initBlendMode();
            egret.MainContext.instance.addEventListener(egret.Event.FINISH_RENDER, this._draw, this);
            egret.TextField.prototype._draw = function (renderContext) {
                var textField = this;
                if (textField.getDirty()) {
                    textField.cacheAsBitmap = true;
                }
                egret.DisplayObject.prototype._draw.call(textField, renderContext);
            };
        }
        WebGLRenderer.prototype.createCanvas = function () {
            var canvas = egret.Browser.getInstance().$("#egretCanvas");
            if (!canvas) {
                var container = document.getElementById(egret.StageDelegate.canvas_div_name);
                canvas = egret.Browser.getInstance().$new("canvas");
                canvas.id = "egretCanvas";
                canvas.width = egret.MainContext.instance.stage.stageWidth; //stageW
                canvas.height = egret.MainContext.instance.stage.stageHeight; //stageH
                canvas.style.width = container.style.width;
                canvas.style.height = container.style.height;
                //                canvas.style.position = "absolute";
                container.appendChild(canvas);
            }
            return canvas;
        };
        WebGLRenderer.prototype.handleContextLost = function () {
            this.contextLost = true;
        };
        WebGLRenderer.prototype.handleContextRestored = function () {
            this.initWebGL();
            this.shaderManager.setContext(this.gl);
            this.contextLost = false;
        };
        WebGLRenderer.prototype.initWebGL = function () {
            var options = {
                stencil: true //设置可以使用模板（用于遮罩实现）
            };
            var gl;
            var names = ["experimental-webgl", "webgl"];
            for (var i = 0; i < names.length; i++) {
                try {
                    gl = this.canvas.getContext(names[i], options);
                }
                catch (e) {
                }
                if (gl) {
                    break;
                }
            }
            if (!gl) {
                throw new Error("当前浏览器不支持webgl");
            }
            this.setContext(gl);
        };
        WebGLRenderer.prototype.setContext = function (gl) {
            this.gl = gl;
            gl.id = this.glContextId++;
            this.vertexBuffer = gl.createBuffer();
            this.indexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);
            gl.disable(gl.DEPTH_TEST);
            gl.disable(gl.CULL_FACE);
            gl.enable(gl.BLEND);
            gl.colorMask(true, true, true, true);
        };
        WebGLRenderer.prototype.initBlendMode = function () {
            this.blendModesWebGL = {};
            this.blendModesWebGL[egret.BlendMode.NORMAL] = [this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA];
            this.blendModesWebGL[egret.BlendMode.ADD] = [this.gl.SRC_ALPHA, this.gl.ONE];
        };
        WebGLRenderer.prototype.start = function () {
            if (this.contextLost) {
                return;
            }
            var gl = this.gl;
            gl.activeTexture(gl.TEXTURE0);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            var shader;
            if (this.colorTransformMatrix) {
                shader = this.shaderManager.colorTransformShader;
            }
            else {
                shader = this.shaderManager.defaultShader;
            }
            this.shaderManager.activateShader(shader);
            shader.syncUniforms();
            gl.uniform2f(shader.projectionVector, this.projectionX, this.projectionY);
            var stride = this.vertSize * 4;
            gl.vertexAttribPointer(shader.aVertexPosition, 2, gl.FLOAT, false, stride, 0);
            gl.vertexAttribPointer(shader.aTextureCoord, 2, gl.FLOAT, false, stride, 2 * 4);
            gl.vertexAttribPointer(shader.colorAttribute, 2, gl.FLOAT, false, stride, 4 * 4);
        };
        WebGLRenderer.prototype.clearScreen = function () {
            var gl = this.gl;
            gl.colorMask(true, true, true, true);
            var list = egret.RenderFilter.getInstance().getDrawAreaList();
            for (var i = 0, l = list.length; i < l; i++) {
                var area = list[i];
                gl.viewport(area.x, area.y, area.width, area.height);
                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                gl.clearColor(0, 0, 0, 0);
                gl.clear(gl.COLOR_BUFFER_BIT);
            }
            var stage = egret.MainContext.instance.stage;
            gl.viewport(0, 0, stage.stageWidth, stage.stageHeight);
            this.renderCost = 0;
        };
        WebGLRenderer.prototype.setBlendMode = function (blendMode) {
            if (!blendMode) {
                blendMode = egret.BlendMode.NORMAL;
            }
            if (this.currentBlendMode != blendMode) {
                var blendModeWebGL = this.blendModesWebGL[blendMode];
                if (blendModeWebGL) {
                    this._draw();
                    this.gl.blendFunc(blendModeWebGL[0], blendModeWebGL[1]);
                    this.currentBlendMode = blendMode;
                }
            }
        };
        WebGLRenderer.prototype.drawRepeatImage = function (texture, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight, repeat) {
            for (var x = destX; x < destWidth; x += sourceWidth) {
                for (var y = destY; y < destHeight; y += sourceHeight) {
                    var destW = Math.min(sourceWidth, destWidth - x);
                    var destH = Math.min(sourceHeight, destHeight - y);
                    this.drawImage(texture, sourceX, sourceY, destW, destH, x, y, destW, destH);
                }
            }
        };
        WebGLRenderer.prototype.drawImage = function (texture, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight, repeat) {
            if (repeat === void 0) { repeat = undefined; }
            if (this.contextLost) {
                return;
            }
            if (repeat !== undefined) {
                this.drawRepeatImage(texture, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight, repeat);
                return;
            }
            var texture_scale_factor = egret.MainContext.instance.rendererContext.texture_scale_factor;
            sourceX = sourceX / texture_scale_factor;
            sourceY = sourceY / texture_scale_factor;
            sourceWidth = sourceWidth / texture_scale_factor;
            sourceHeight = sourceHeight / texture_scale_factor;
            this.createWebGLTexture(texture);
            if (texture.webGLTexture !== this.currentBaseTexture || this.currentBatchSize >= this.size - 1) {
                this._draw();
                this.currentBaseTexture = texture.webGLTexture;
            }
            //计算出绘制矩阵，之后把矩阵还原回之前的
            var locWorldTransform = this.worldTransform;
            var originalA = locWorldTransform.a;
            var originalB = locWorldTransform.b;
            var originalC = locWorldTransform.c;
            var originalD = locWorldTransform.d;
            var originalTx = locWorldTransform.tx;
            var originalTy = locWorldTransform.ty;
            if (destX != 0 || destY != 0) {
                locWorldTransform.append(1, 0, 0, 1, destX, destY);
            }
            if (sourceWidth / destWidth != 1 || sourceHeight / destHeight != 1) {
                locWorldTransform.append(destWidth / sourceWidth, 0, 0, destHeight / sourceHeight, 0, 0);
            }
            var a = locWorldTransform.a;
            var b = locWorldTransform.b;
            var c = locWorldTransform.c;
            var d = locWorldTransform.d;
            var tx = locWorldTransform.tx;
            var ty = locWorldTransform.ty;
            locWorldTransform.a = originalA;
            locWorldTransform.b = originalB;
            locWorldTransform.c = originalC;
            locWorldTransform.d = originalD;
            locWorldTransform.tx = originalTx;
            locWorldTransform.ty = originalTy;
            var width = texture._sourceWidth;
            var height = texture._sourceHeight;
            var w = sourceWidth;
            var h = sourceHeight;
            sourceX = sourceX / width;
            sourceY = sourceY / height;
            sourceWidth = sourceWidth / width;
            sourceHeight = sourceHeight / height;
            var vertices = this.vertices;
            var index = this.currentBatchSize * 4 * this.vertSize;
            var alpha = this.worldAlpha;
            // xy
            vertices[index++] = tx;
            vertices[index++] = ty;
            // uv
            vertices[index++] = sourceX;
            vertices[index++] = sourceY;
            // alpha
            vertices[index++] = alpha;
            // xy
            vertices[index++] = a * w + tx;
            vertices[index++] = b * w + ty;
            // uv
            vertices[index++] = sourceWidth + sourceX;
            vertices[index++] = sourceY;
            // alpha
            vertices[index++] = alpha;
            // xy
            vertices[index++] = a * w + c * h + tx;
            vertices[index++] = d * h + b * w + ty;
            // uv
            vertices[index++] = sourceWidth + sourceX;
            vertices[index++] = sourceHeight + sourceY;
            // alpha
            vertices[index++] = alpha;
            // xy
            vertices[index++] = c * h + tx;
            vertices[index++] = d * h + ty;
            // uv
            vertices[index++] = sourceX;
            vertices[index++] = sourceHeight + sourceY;
            // alpha
            vertices[index++] = alpha;
            this.currentBatchSize++;
        };
        WebGLRenderer.prototype._draw = function () {
            if (this.currentBatchSize == 0 || this.contextLost) {
                return;
            }
            var beforeDraw = egret.getTimer();
            this.start();
            var gl = this.gl;
            gl.bindTexture(gl.TEXTURE_2D, this.currentBaseTexture);
            var view = this.vertices.subarray(0, this.currentBatchSize * 4 * this.vertSize);
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, view);
            gl.drawElements(gl.TRIANGLES, this.currentBatchSize * 6, gl.UNSIGNED_SHORT, 0);
            this.currentBatchSize = 0;
            this.renderCost += egret.getTimer() - beforeDraw;
            egret.Profiler.getInstance().onDrawImage();
        };
        WebGLRenderer.prototype.setTransform = function (matrix) {
            var locWorldTransform = this.worldTransform;
            locWorldTransform.a = matrix.a;
            locWorldTransform.b = matrix.b;
            locWorldTransform.c = matrix.c;
            locWorldTransform.d = matrix.d;
            locWorldTransform.tx = matrix.tx;
            locWorldTransform.ty = matrix.ty;
        };
        WebGLRenderer.prototype.setAlpha = function (value, blendMode) {
            this.worldAlpha = value;
            this.setBlendMode(blendMode);
        };
        WebGLRenderer.prototype.createWebGLTexture = function (texture) {
            if (!texture.webGLTexture) {
                var gl = this.gl;
                texture.webGLTexture = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, texture.webGLTexture);
                gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture._bitmapData);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.bindTexture(gl.TEXTURE_2D, null);
            }
        };
        WebGLRenderer.prototype.pushMask = function (mask) {
            this._draw();
            var gl = this.gl;
            if (this.maskList.length == 0) {
                gl.enable(gl.STENCIL_TEST);
                gl.stencilFunc(gl.ALWAYS, 1, 1);
            }
            var maskData = this.maskDataFreeList.pop();
            if (!maskData) {
                maskData = { x: mask.x, y: mask.y, w: mask.width, h: mask.height };
            }
            else {
                maskData.x = mask.x;
                maskData.y = mask.y;
                maskData.w = mask.width;
                maskData.h = mask.height;
            }
            this.maskList.push(maskData);
            gl.colorMask(false, false, false, false);
            gl.stencilOp(gl.KEEP, gl.KEEP, gl.INCR);
            this.renderGraphics(maskData);
            gl.colorMask(true, true, true, true);
            gl.stencilFunc(gl.NOTEQUAL, 0, this.maskList.length);
            gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
        };
        WebGLRenderer.prototype.popMask = function () {
            this._draw();
            var gl = this.gl;
            var maskData = this.maskList.pop();
            if (maskData) {
                gl.colorMask(false, false, false, false);
                gl.stencilOp(gl.KEEP, gl.KEEP, gl.DECR);
                this.renderGraphics(maskData);
                gl.colorMask(true, true, true, true);
                gl.stencilFunc(gl.NOTEQUAL, 0, this.maskList.length);
                gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
                this.maskDataFreeList.push(maskData);
            }
            if (this.maskList.length == 0) {
                gl.disable(gl.STENCIL_TEST);
            }
        };
        WebGLRenderer.prototype.setGlobalColorTransform = function (colorTransformMatrix) {
            if (this.colorTransformMatrix != colorTransformMatrix) {
                this._draw();
                this.colorTransformMatrix = colorTransformMatrix;
                if (colorTransformMatrix) {
                    var colorTransformMatrix = colorTransformMatrix.concat();
                    var shader = this.shaderManager.colorTransformShader;
                    shader.uniforms.colorAdd.value.w = colorTransformMatrix.splice(19, 1)[0] / 255.0;
                    shader.uniforms.colorAdd.value.z = colorTransformMatrix.splice(14, 1)[0] / 255.0;
                    shader.uniforms.colorAdd.value.y = colorTransformMatrix.splice(9, 1)[0] / 255.0;
                    shader.uniforms.colorAdd.value.x = colorTransformMatrix.splice(4, 1)[0] / 255.0;
                    shader.uniforms.matrix.value = colorTransformMatrix;
                }
            }
        };
        WebGLRenderer.prototype.setupFont = function (textField) {
            var ctx = this.canvasContext;
            var font = textField.italic ? "italic " : "normal ";
            font += textField.bold ? "bold " : "normal ";
            font += textField.size + "px " + textField.fontFamily;
            ctx.font = font;
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
        };
        WebGLRenderer.prototype.measureText = function (text) {
            var result = this.canvasContext.measureText(text);
            return result.width;
        };
        WebGLRenderer.prototype.renderGraphics = function (graphics) {
            var gl = this.gl;
            var shader = this.shaderManager.primitiveShader;
            if (!this.graphicsPoints) {
                this.graphicsPoints = [];
                this.graphicsIndices = [];
                this.graphicsBuffer = gl.createBuffer();
                this.graphicsIndexBuffer = gl.createBuffer();
            }
            else {
                this.graphicsPoints.length = 0;
                this.graphicsIndices.length = 0;
            }
            this.updateGraphics(graphics);
            this.shaderManager.activateShader(shader);
            gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
            gl.uniformMatrix3fv(shader.translationMatrix, false, this.worldTransform.toArray(true));
            gl.uniform2f(shader.projectionVector, this.projectionX, -this.projectionY);
            gl.uniform2f(shader.offsetVector, 0, 0);
            gl.uniform3fv(shader.tintColor, [1, 1, 1]);
            gl.uniform1f(shader.alpha, this.worldAlpha);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.graphicsBuffer);
            gl.vertexAttribPointer(shader.aVertexPosition, 2, gl.FLOAT, false, 4 * 6, 0);
            gl.vertexAttribPointer(shader.colorAttribute, 4, gl.FLOAT, false, 4 * 6, 2 * 4);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.graphicsIndexBuffer);
            gl.drawElements(gl.TRIANGLE_STRIP, this.graphicsIndices.length, gl.UNSIGNED_SHORT, 0);
            this.shaderManager.activateShader(this.shaderManager.defaultShader);
        };
        WebGLRenderer.prototype.updateGraphics = function (graphics) {
            var gl = this.gl;
            this.buildRectangle(graphics);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.graphicsBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.graphicsPoints), gl.STATIC_DRAW);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.graphicsIndexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.graphicsIndices), gl.STATIC_DRAW);
        };
        WebGLRenderer.prototype.buildRectangle = function (graphicsData) {
            var x = graphicsData.x;
            var y = graphicsData.y;
            var width = graphicsData.w;
            var height = graphicsData.h;
            var r = 0;
            var g = 0;
            var b = 0;
            var alpha = 1;
            var verts = this.graphicsPoints;
            var indices = this.graphicsIndices;
            var vertPos = verts.length / 6;
            verts.push(x, y);
            verts.push(r, g, b, alpha);
            verts.push(x + width, y);
            verts.push(r, g, b, alpha);
            verts.push(x, y + height);
            verts.push(r, g, b, alpha);
            verts.push(x + width, y + height);
            verts.push(r, g, b, alpha);
            indices.push(vertPos, vertPos, vertPos + 1, vertPos + 2, vertPos + 3, vertPos + 3);
        };
        return WebGLRenderer;
    })(egret.RendererContext);
    egret.WebGLRenderer = WebGLRenderer;
    WebGLRenderer.prototype.__class__ = "egret.WebGLRenderer";
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var egret;
(function (egret) {
    var WebGLUtils = (function () {
        function WebGLUtils() {
        }
        WebGLUtils.compileProgram = function (gl, vertexSrc, fragmentSrc) {
            var fragmentShader = WebGLUtils.compileFragmentShader(gl, fragmentSrc);
            var vertexShader = WebGLUtils.compileVertexShader(gl, vertexSrc);
            var shaderProgram = gl.createProgram();
            gl.attachShader(shaderProgram, vertexShader);
            gl.attachShader(shaderProgram, fragmentShader);
            gl.linkProgram(shaderProgram);
            if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
                console.log("无法初始化着色器");
            }
            return shaderProgram;
        };
        WebGLUtils.compileFragmentShader = function (gl, shaderSrc) {
            return WebGLUtils._compileShader(gl, shaderSrc, gl.FRAGMENT_SHADER);
        };
        WebGLUtils.compileVertexShader = function (gl, shaderSrc) {
            return WebGLUtils._compileShader(gl, shaderSrc, gl.VERTEX_SHADER);
        };
        WebGLUtils._compileShader = function (gl, shaderSrc, shaderType) {
            var shader = gl.createShader(shaderType);
            gl.shaderSource(shader, shaderSrc);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.log(gl.getShaderInfoLog(shader));
                return null;
            }
            return shader;
        };
        WebGLUtils.checkCanUseWebGL = function () {
            if (WebGLUtils.canUseWebGL == undefined) {
                try {
                    var canvas = document.createElement("canvas");
                    WebGLUtils.canUseWebGL = !!window["WebGLRenderingContext"] && !!(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
                }
                catch (e) {
                    WebGLUtils.canUseWebGL = false;
                }
            }
            return WebGLUtils.canUseWebGL;
        };
        return WebGLUtils;
    })();
    egret.WebGLUtils = WebGLUtils;
    WebGLUtils.prototype.__class__ = "egret.WebGLUtils";
})(egret || (egret = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var egret;
(function (egret) {
    var WebGLShaderManager = (function () {
        function WebGLShaderManager(gl) {
            this.maxAttibs = 10;
            this.attribState = [];
            this.tempAttribState = [];
            for (var i = 0; i < this.maxAttibs; i++) {
                this.attribState[i] = false;
            }
            this.setContext(gl);
        }
        WebGLShaderManager.prototype.setContext = function (gl) {
            this.gl = gl;
            this.primitiveShader = new PrimitiveShader(gl);
            this.defaultShader = new EgretShader(gl);
            this.colorTransformShader = new ColorTransformShader(gl);
            this.activateShader(this.defaultShader);
        };
        WebGLShaderManager.prototype.activateShader = function (shader) {
            if (this.currentShader != shader) {
                this.gl.useProgram(shader.program);
                this.setAttribs(shader.attributes);
                this.currentShader = shader;
            }
        };
        WebGLShaderManager.prototype.setAttribs = function (attribs) {
            var i;
            var l;
            l = this.tempAttribState.length;
            for (i = 0; i < l; i++) {
                this.tempAttribState[i] = false;
            }
            l = attribs.length;
            for (i = 0; i < l; i++) {
                var attribId = attribs[i];
                this.tempAttribState[attribId] = true;
            }
            var gl = this.gl;
            l = this.attribState.length;
            for (i = 0; i < l; i++) {
                if (this.attribState[i] !== this.tempAttribState[i]) {
                    this.attribState[i] = this.tempAttribState[i];
                    if (this.tempAttribState[i]) {
                        gl.enableVertexAttribArray(i);
                    }
                    else {
                        gl.disableVertexAttribArray(i);
                    }
                }
            }
        };
        return WebGLShaderManager;
    })();
    egret.WebGLShaderManager = WebGLShaderManager;
    WebGLShaderManager.prototype.__class__ = "egret.WebGLShaderManager";
    var EgretShader = (function () {
        function EgretShader(gl) {
            this.defaultVertexSrc = "attribute vec2 aVertexPosition;\n" + "attribute vec2 aTextureCoord;\n" + "attribute vec2 aColor;\n" + "uniform vec2 projectionVector;\n" + "uniform vec2 offsetVector;\n" + "varying vec2 vTextureCoord;\n" + "varying vec4 vColor;\n" + "const vec2 center = vec2(-1.0, 1.0);\n" + "void main(void) {\n" + "   gl_Position = vec4( ((aVertexPosition + offsetVector) / projectionVector) + center , 0.0, 1.0);\n" + "   vTextureCoord = aTextureCoord;\n" + "   vColor = vec4(aColor.x, aColor.x, aColor.x, aColor.x);\n" + "}";
            this.program = null;
            this.fragmentSrc = "precision lowp float;\n" + "varying vec2 vTextureCoord;\n" + "varying vec4 vColor;\n" + "uniform sampler2D uSampler;\n" + "void main(void) {\n" + "gl_FragColor = texture2D(uSampler, vTextureCoord) * vColor ;\n" + "}";
            this.gl = gl;
            this.init();
        }
        EgretShader.prototype.init = function () {
            var gl = this.gl;
            var program = egret.WebGLUtils.compileProgram(gl, this.defaultVertexSrc, this.fragmentSrc);
            gl.useProgram(program);
            this.uSampler = gl.getUniformLocation(program, "uSampler");
            this.projectionVector = gl.getUniformLocation(program, "projectionVector");
            this.offsetVector = gl.getUniformLocation(program, "offsetVector");
            this.dimensions = gl.getUniformLocation(program, "dimensions");
            this.aVertexPosition = gl.getAttribLocation(program, "aVertexPosition");
            this.aTextureCoord = gl.getAttribLocation(program, "aTextureCoord");
            this.colorAttribute = gl.getAttribLocation(program, "aColor");
            if (this.colorAttribute === -1) {
                this.colorAttribute = 2;
            }
            this.attributes = [this.aVertexPosition, this.aTextureCoord, this.colorAttribute];
            for (var key in this.uniforms) {
                this.uniforms[key].uniformLocation = gl.getUniformLocation(program, key);
            }
            this.initUniforms();
            this.program = program;
        };
        EgretShader.prototype.initUniforms = function () {
            if (!this.uniforms) {
                return;
            }
            var gl = this.gl;
            var uniform;
            for (var key in this.uniforms) {
                uniform = this.uniforms[key];
                var type = uniform.type;
                if (type === 'mat2' || type === 'mat3' || type === 'mat4') {
                    uniform.glMatrix = true;
                    uniform.glValueLength = 1;
                    if (type === 'mat2') {
                        uniform.glFunc = gl.uniformMatrix2fv;
                    }
                    else if (type === 'mat3') {
                        uniform.glFunc = gl.uniformMatrix3fv;
                    }
                    else if (type === 'mat4') {
                        uniform.glFunc = gl.uniformMatrix4fv;
                    }
                }
                else {
                    uniform.glFunc = gl['uniform' + type];
                    if (type === '2f' || type === '2i') {
                        uniform.glValueLength = 2;
                    }
                    else if (type === '3f' || type === '3i') {
                        uniform.glValueLength = 3;
                    }
                    else if (type === '4f' || type === '4i') {
                        uniform.glValueLength = 4;
                    }
                    else {
                        uniform.glValueLength = 1;
                    }
                }
            }
        };
        EgretShader.prototype.syncUniforms = function () {
            if (!this.uniforms) {
                return;
            }
            var uniform;
            var gl = this.gl;
            for (var key in this.uniforms) {
                uniform = this.uniforms[key];
                if (uniform.glValueLength === 1) {
                    if (uniform.glMatrix === true) {
                        uniform.glFunc.call(gl, uniform.uniformLocation, uniform.transpose, uniform.value);
                    }
                    else {
                        uniform.glFunc.call(gl, uniform.uniformLocation, uniform.value);
                    }
                }
                else if (uniform.glValueLength === 2) {
                    uniform.glFunc.call(gl, uniform.uniformLocation, uniform.value.x, uniform.value.y);
                }
                else if (uniform.glValueLength === 3) {
                    uniform.glFunc.call(gl, uniform.uniformLocation, uniform.value.x, uniform.value.y, uniform.value.z);
                }
                else if (uniform.glValueLength === 4) {
                    uniform.glFunc.call(gl, uniform.uniformLocation, uniform.value.x, uniform.value.y, uniform.value.z, uniform.value.w);
                }
            }
        };
        return EgretShader;
    })();
    egret.EgretShader = EgretShader;
    EgretShader.prototype.__class__ = "egret.EgretShader";
    var ColorTransformShader = (function (_super) {
        __extends(ColorTransformShader, _super);
        function ColorTransformShader(gl) {
            _super.call(this, gl);
            this.fragmentSrc = "precision mediump float;\n" + "varying vec2 vTextureCoord;\n" + "varying vec4 vColor;\n" + "uniform float invert;\n" + "uniform mat4 matrix;\n" + "uniform vec4 colorAdd;\n" + "uniform sampler2D uSampler;\n" + "void main(void) {\n" + "vec4 locColor = texture2D(uSampler, vTextureCoord) * matrix;\n" + "if(locColor.a != 0.0){\n" + "locColor += colorAdd;\n" + "}\n" + "gl_FragColor = locColor;\n" + "}";
            this.uniforms = {
                matrix: { type: 'mat4', value: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] },
                colorAdd: { type: '4f', value: { x: 0, y: 0, z: 0, w: 0 } }
            };
            this.init();
        }
        return ColorTransformShader;
    })(EgretShader);
    egret.ColorTransformShader = ColorTransformShader;
    ColorTransformShader.prototype.__class__ = "egret.ColorTransformShader";
    var PrimitiveShader = (function () {
        function PrimitiveShader(gl) {
            this.program = null;
            this.projectionVector = null;
            this.offsetVector = null;
            this.tintColor = null;
            this.aVertexPosition = null;
            this.colorAttribute = null;
            this.attributes = null;
            this.translationMatrix = null;
            this.alpha = null;
            this.fragmentSrc = "precision mediump float;\n" + "varying vec4 vColor;\n" + "void main(void) {\n" + "   gl_FragColor = vColor;\n" + "}";
            this.vertexSrc = "attribute vec2 aVertexPosition;\n" + "attribute vec4 aColor;\n" + "uniform mat3 translationMatrix;\n" + "uniform vec2 projectionVector;\n" + "uniform vec2 offsetVector;\n" + "uniform float alpha;\n" + "uniform vec3 tint;\n" + "varying vec4 vColor;\n" + "void main(void) {\n" + "   vec3 v = translationMatrix * vec3(aVertexPosition , 1.0);\n" + "   v -= offsetVector.xyx;\n" + "   gl_Position = vec4( v.x / projectionVector.x -1.0, v.y / -projectionVector.y + 1.0 , 0.0, 1.0);\n" + "   vColor = aColor * vec4(tint * alpha, alpha);\n" + "}";
            this.gl = gl;
            this.init();
        }
        PrimitiveShader.prototype.init = function () {
            var gl = this.gl;
            var program = egret.WebGLUtils.compileProgram(gl, this.vertexSrc, this.fragmentSrc);
            gl.useProgram(program);
            this.projectionVector = gl.getUniformLocation(program, "projectionVector");
            this.offsetVector = gl.getUniformLocation(program, "offsetVector");
            this.tintColor = gl.getUniformLocation(program, "tint");
            this.aVertexPosition = gl.getAttribLocation(program, "aVertexPosition");
            this.colorAttribute = gl.getAttribLocation(program, "aColor");
            this.attributes = [this.aVertexPosition, this.colorAttribute];
            this.translationMatrix = gl.getUniformLocation(program, "translationMatrix");
            this.alpha = gl.getUniformLocation(program, "alpha");
            this.program = program;
        };
        return PrimitiveShader;
    })();
    egret.PrimitiveShader = PrimitiveShader;
    PrimitiveShader.prototype.__class__ = "egret.PrimitiveShader";
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var egret;
(function (egret) {
    /**
     * @class egret.HTML5NetContext
     * @classdesc
     * @extends egret.NetContext
     */
    var HTML5NetContext = (function (_super) {
        __extends(HTML5NetContext, _super);
        function HTML5NetContext() {
            _super.call(this);
        }
        HTML5NetContext.prototype.proceed = function (loader) {
            if (loader.dataFormat == egret.URLLoaderDataFormat.TEXTURE) {
                this.loadTexture(loader);
                return;
            }
            if (loader.dataFormat == egret.URLLoaderDataFormat.SOUND) {
                //                if(WebAudio.canUseWebAudio) {
                //                    this.loadWebAudio(loader);
                //                }
                //                else {
                this.loadSound(loader);
                //                }
                return;
            }
            var request = loader._request;
            var xhr = this.getXHR();
            //            xhr.onload = onLoadComplete;
            xhr.onreadystatechange = onReadyStateChange;
            var url = egret.NetContext._getUrl(request);
            xhr.open(request.method, url, true);
            this.setResponseType(xhr, loader.dataFormat);
            if (request.method == egret.URLRequestMethod.GET || !request.data) {
                xhr.send();
            }
            else if (request.data instanceof egret.URLVariables) {
                xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                var urlVars = request.data;
                xhr.send(urlVars.toString());
            }
            else {
                xhr.setRequestHeader("Content-Type", "multipart/form-data");
                xhr.send(request.data);
            }
            function onReadyStateChange() {
                if (xhr.readyState == 4) {
                    if (xhr.status != loader._status) {
                        loader._status = xhr.status;
                        egret.HTTPStatusEvent.dispatchHTTPStatusEvent(loader, xhr.status);
                    }
                    if (xhr.status >= 400 || xhr.status == 0) {
                        egret.IOErrorEvent.dispatchIOErrorEvent(loader);
                    }
                    else {
                        onLoadComplete();
                    }
                }
            }
            function onLoadComplete() {
                switch (loader.dataFormat) {
                    case egret.URLLoaderDataFormat.TEXT:
                        loader.data = xhr.responseText;
                        break;
                    case egret.URLLoaderDataFormat.VARIABLES:
                        loader.data = new egret.URLVariables(xhr.responseText);
                        break;
                    case egret.URLLoaderDataFormat.BINARY:
                        loader.data = xhr.response;
                        break;
                    default:
                        loader.data = xhr.responseText;
                        break;
                }
                egret.__callAsync(egret.Event.dispatchEvent, egret.Event, loader, egret.Event.COMPLETE);
            }
        };
        HTML5NetContext.prototype.loadSound = function (loader) {
            var request = loader._request;
            var audio = new Audio(request.url);
            audio["__timeoutId"] = window.setTimeout(soundPreloadCanplayHandler, 100);
            audio.addEventListener('canplaythrough', soundPreloadCanplayHandler, false);
            audio.addEventListener("error", soundPreloadErrorHandler, false);
            audio.load();
            function soundPreloadCanplayHandler(event) {
                window.clearTimeout(audio["__timeoutId"]);
                audio.removeEventListener('canplaythrough', soundPreloadCanplayHandler, false);
                audio.removeEventListener("error", soundPreloadErrorHandler, false);
                var sound = new egret.Sound();
                sound._setAudio(audio);
                loader.data = sound;
                egret.__callAsync(egret.Event.dispatchEvent, egret.Event, loader, egret.Event.COMPLETE);
            }
            ;
            function soundPreloadErrorHandler(event) {
                window.clearTimeout(audio["__timeoutId"]);
                audio.removeEventListener('canplaythrough', soundPreloadCanplayHandler, false);
                audio.removeEventListener("error", soundPreloadErrorHandler, false);
                egret.IOErrorEvent.dispatchIOErrorEvent(loader);
            }
            ;
        };
        //        private loadWebAudio(loader:URLLoader):void {
        //            var url:string = loader._request.url;
        //            var request = new XMLHttpRequest();
        //            request.open("GET", url, true);
        //            request.responseType = "arraybuffer";
        //            console.log("loadWebAudio");
        //            request.onload = function () {
        //                WebAudio.ctx["decodeAudioData"](request.response, onSuccessHandler, onErrorHandler);
        //            };
        //            request.send();
        //
        //            function onSuccessHandler(buffer) {
        //                var audio = new WebAudio();
        //                audio._buffer = buffer;
        //
        //                var sound = new Sound();
        //                sound._setAudio(audio);
        //                loader.data = sound;
        //                __callAsync(Event.dispatchEvent, Event, loader, Event.COMPLETE);
        //            }
        //
        //            function onErrorHandler() {
        //                IOErrorEvent.dispatchIOErrorEvent(loader);
        //            }
        //        }
        HTML5NetContext.prototype.getXHR = function () {
            if (window["XMLHttpRequest"]) {
                return new window["XMLHttpRequest"]();
            }
            else {
                return new ActiveXObject("MSXML2.XMLHTTP");
            }
        };
        HTML5NetContext.prototype.setResponseType = function (xhr, responseType) {
            switch (responseType) {
                case egret.URLLoaderDataFormat.TEXT:
                case egret.URLLoaderDataFormat.VARIABLES:
                    xhr.responseType = egret.URLLoaderDataFormat.TEXT;
                    break;
                case egret.URLLoaderDataFormat.BINARY:
                    xhr.responseType = "arraybuffer";
                    break;
                default:
                    xhr.responseType = responseType;
                    break;
            }
        };
        HTML5NetContext.prototype.loadTexture = function (loader) {
            var request = loader._request;
            var image = new Image();
            //            image.crossOrigin = "Anonymous";
            image.onload = onImageComplete;
            image.onerror = onLoadError;
            image.src = request.url;
            function onImageComplete(event) {
                image.onerror = null;
                image.onload = null;
                var texture = new egret.Texture();
                texture._setBitmapData(image);
                loader.data = texture;
                egret.__callAsync(egret.Event.dispatchEvent, egret.Event, loader, egret.Event.COMPLETE);
            }
            function onLoadError(event) {
                image.onerror = null;
                image.onload = null;
                egret.IOErrorEvent.dispatchIOErrorEvent(loader);
            }
        };
        return HTML5NetContext;
    })(egret.NetContext);
    egret.HTML5NetContext = HTML5NetContext;
    HTML5NetContext.prototype.__class__ = "egret.HTML5NetContext";
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var egret;
(function (egret) {
    var HTML5TouchContext = (function (_super) {
        __extends(HTML5TouchContext, _super);
        function HTML5TouchContext() {
            _super.call(this);
            this._isTouchDown = false;
            this.rootDiv = document.getElementById(egret.StageDelegate.canvas_div_name);
        }
        HTML5TouchContext.prototype.prevent = function (event) {
            event.stopPropagation();
            if (event["isScroll"] != true) {
                event.preventDefault();
            }
        };
        HTML5TouchContext.prototype.run = function () {
            var that = this;
            if (window.navigator.msPointerEnabled) {
                this.rootDiv.addEventListener("MSPointerDown", function (event) {
                    that._onTouchBegin(event);
                    that.prevent(event);
                }, false);
                this.rootDiv.addEventListener("MSPointerMove", function (event) {
                    that._onTouchMove(event);
                    that.prevent(event);
                }, false);
                this.rootDiv.addEventListener("MSPointerUp", function (event) {
                    that._onTouchEnd(event);
                    that.prevent(event);
                }, false);
            }
            else if (egret.MainContext.deviceType == egret.MainContext.DEVICE_MOBILE) {
                this.addTouchListener();
            }
            else if (egret.MainContext.deviceType == egret.MainContext.DEVICE_PC) {
                this.addTouchListener();
                this.addMouseListener();
            }
            window.addEventListener("mousedown", function (event) {
                if (!that.inOutOfCanvas(event)) {
                    that._isTouchDown = true;
                }
                else {
                    that.dispatchLeaveStageEvent();
                }
            });
            window.addEventListener("mouseup", function (event) {
                if (that._isTouchDown) {
                    if (that.inOutOfCanvas(event))
                        that.dispatchLeaveStageEvent();
                    else
                        that._onTouchEnd(event);
                }
                that._isTouchDown = false;
            });
        };
        HTML5TouchContext.prototype.addMouseListener = function () {
            var that = this;
            this.rootDiv.addEventListener("mousedown", function (event) {
                that._onTouchBegin(event);
            });
            this.rootDiv.addEventListener("mousemove", function (event) {
                that._onTouchMove(event);
            });
            this.rootDiv.addEventListener("mouseup", function (event) {
                that._onTouchEnd(event);
            });
        };
        HTML5TouchContext.prototype.addTouchListener = function () {
            var that = this;
            this.rootDiv.addEventListener("touchstart", function (event) {
                var l = event.changedTouches.length;
                for (var i = 0; i < l; i++) {
                    that._onTouchBegin(event.changedTouches[i]);
                }
                that.prevent(event);
            }, false);
            this.rootDiv.addEventListener("touchmove", function (event) {
                var l = event.changedTouches.length;
                for (var i = 0; i < l; i++) {
                    that._onTouchMove(event.changedTouches[i]);
                }
                that.prevent(event);
            }, false);
            this.rootDiv.addEventListener("touchend", function (event) {
                var l = event.changedTouches.length;
                for (var i = 0; i < l; i++) {
                    that._onTouchEnd(event.changedTouches[i]);
                }
                that.prevent(event);
            }, false);
            this.rootDiv.addEventListener("touchcancel", function (event) {
                var l = event.changedTouches.length;
                for (var i = 0; i < l; i++) {
                    that._onTouchEnd(event.changedTouches[i]);
                }
                that.prevent(event);
            }, false);
        };
        HTML5TouchContext.prototype.inOutOfCanvas = function (event) {
            var location = this.getLocation(this.rootDiv, event);
            var x = location.x, y = location.y;
            var stage = egret.MainContext.instance.stage;
            if (x < 0 || y < 0 || x > stage.stageWidth || y > stage.stageHeight) {
                return true;
            }
            return false;
        };
        HTML5TouchContext.prototype.dispatchLeaveStageEvent = function () {
            this.touchingIdentifiers.length = 0;
            egret.MainContext.instance.stage.dispatchEventWith(egret.Event.LEAVE_STAGE);
        };
        HTML5TouchContext.prototype._onTouchBegin = function (event) {
            var location = this.getLocation(this.rootDiv, event);
            var identifier = -1;
            if (event.hasOwnProperty("identifier")) {
                identifier = event.identifier;
            }
            this.onTouchBegan(location.x, location.y, identifier);
        };
        HTML5TouchContext.prototype._onTouchMove = function (event) {
            var location = this.getLocation(this.rootDiv, event);
            var identifier = -1;
            if (event.hasOwnProperty("identifier")) {
                identifier = event.identifier;
            }
            this.onTouchMove(location.x, location.y, identifier);
        };
        HTML5TouchContext.prototype._onTouchEnd = function (event) {
            var location = this.getLocation(this.rootDiv, event);
            var identifier = -1;
            if (event.hasOwnProperty("identifier")) {
                identifier = event.identifier;
            }
            this.onTouchEnd(location.x, location.y, identifier);
        };
        HTML5TouchContext.prototype.getLocation = function (rootDiv, event) {
            var doc = document.documentElement;
            var win = window;
            var left, top, tx, ty;
            if (typeof rootDiv.getBoundingClientRect === 'function') {
                var box = rootDiv.getBoundingClientRect();
                left = box.left;
                top = box.top;
            }
            else {
                left = 0;
                top = 0;
            }
            left += win.pageXOffset - doc.clientLeft;
            top += win.pageYOffset - doc.clientTop;
            if (event.pageX != null) {
                tx = event.pageX;
                ty = event.pageY;
            }
            else {
                left -= document.body.scrollLeft;
                top -= document.body.scrollTop;
                tx = event.clientX;
                ty = event.clientY;
            }
            var result = egret.Point.identity;
            result.x = (tx - left) / egret.StageDelegate.getInstance().getScaleX();
            result.y = (ty - top) / egret.StageDelegate.getInstance().getScaleY();
            return result;
        };
        return HTML5TouchContext;
    })(egret.TouchContext);
    egret.HTML5TouchContext = HTML5TouchContext;
    HTML5TouchContext.prototype.__class__ = "egret.HTML5TouchContext";
})(egret || (egret = {}));

/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var egret;
(function (egret) {
    /**
     * @class egret.StageText
     * @classdesc
     * @extends egret.HashObject
     */
    var HTML5StageText = (function (_super) {
        __extends(HTML5StageText, _super);
        function HTML5StageText() {
            _super.call(this);
            this._hasListeners = false;
            this._inputType = "";
            this._isShow = false;
            this.textValue = "";
            this._width = 0;
            this._height = 0;
            this._styleInfoes = {};
            var scaleX = egret.StageDelegate.getInstance().getScaleX();
            var scaleY = egret.StageDelegate.getInstance().getScaleY();
            var div = egret.Browser.getInstance().$new("div");
            div.position.x = 0;
            div.position.y = 0;
            div.scale.x = scaleX;
            div.scale.y = scaleY;
            div.transforms();
            div.style[egret_dom.getTrans("transformOrigin")] = "0% 0% 0px";
            this.div = div;
            var stage = egret.MainContext.instance.stage;
            var stageWidth = stage.stageWidth;
            var stageHeight = stage.stageHeight;
            var shape = new egret.Shape();
            //            shape.graphics.beginFill(0x000000, .3);
            //            shape.graphics.drawRect(0, 0, stageWidth, stageHeight);
            //            shape.graphics.endFill();
            shape.width = stageWidth;
            shape.height = stageHeight;
            shape.touchEnabled = true;
            this._shape = shape;
            this.getStageDelegateDiv().appendChild(this.div);
        }
        HTML5StageText.prototype.getStageDelegateDiv = function () {
            var stageDelegateDiv = egret.Browser.getInstance().$("#StageDelegateDiv");
            if (!stageDelegateDiv) {
                stageDelegateDiv = egret.Browser.getInstance().$new("div");
                stageDelegateDiv.id = "StageDelegateDiv";
                //                stageDelegateDiv.style.position = "absolute";
                var container = document.getElementById(egret.StageDelegate.canvas_div_name);
                container.appendChild(stageDelegateDiv);
                stageDelegateDiv.transforms();
            }
            return stageDelegateDiv;
        };
        HTML5StageText.prototype._setMultiline = function (value) {
            _super.prototype._setMultiline.call(this, value);
            this.createInput();
        };
        HTML5StageText.prototype.callHandler = function (e) {
            e.stopPropagation();
        };
        HTML5StageText.prototype._add = function () {
            if (this.div && this.div.parentNode == null) {
                this.getStageDelegateDiv().appendChild(this.div);
            }
        };
        /**
         * @method egret.StageText#remove
         */
        HTML5StageText.prototype._remove = function () {
            if (this._shape && this._shape.parent) {
                this._shape.parent.removeChild(this._shape);
            }
            if (this.div && this.div.parentNode) {
                this.div.parentNode.removeChild(this.div);
            }
        };
        HTML5StageText.prototype._addListeners = function () {
            if (this.inputElement && !this._hasListeners) {
                this._hasListeners = true;
                this.inputElement.addEventListener("mousedown", this.callHandler);
                this.inputElement.addEventListener("touchstart", this.callHandler);
                this.inputElement.addEventListener("MSPointerDown", this.callHandler);
            }
        };
        HTML5StageText.prototype._removeListeners = function () {
            if (this.inputElement && this._hasListeners) {
                this._hasListeners = false;
                this.inputElement.removeEventListener("mousedown", this.callHandler);
                this.inputElement.removeEventListener("touchstart", this.callHandler);
                this.inputElement.removeEventListener("MSPointerDown", this.callHandler);
            }
        };
        HTML5StageText.prototype.createInput = function () {
            var type = this._multiline ? "textarea" : "input";
            if (this._inputType == type) {
                return;
            }
            this._inputType = type;
            if (this.inputElement != null) {
                this._removeListeners();
                this.div.removeChild(this.inputElement);
            }
            if (this._multiline) {
                var inputElement = document.createElement("textarea");
                inputElement.style["resize"] = "none";
            }
            else {
                inputElement = document.createElement("input");
            }
            inputElement.type = "text";
            this.inputElement = inputElement;
            this.inputElement.value = "";
            this.div.appendChild(inputElement);
            this._addListeners();
            this.setElementStyle("width", 0 + "px");
            //默认值
            this.setElementStyle("border", "none");
            this.setElementStyle("margin", "0");
            this.setElementStyle("padding", "0");
            this.setElementStyle("outline", "medium");
            this.setElementStyle("verticalAlign", "top");
            this.setElementStyle("wordBreak", "break-all");
            this.setElementStyle("overflow", "hidden");
        };
        /**
         * @method egret.StageText#open
         * @param x {number}
         * @param y {number}
         * @param width {number}
         * @param height {number}
         */
        HTML5StageText.prototype._open = function (x, y, width, height) {
            if (width === void 0) { width = 160; }
            if (height === void 0) { height = 21; }
        };
        HTML5StageText.prototype._setScale = function (x, y) {
            _super.prototype._setScale.call(this, x, y);
            var scaleX = egret.StageDelegate.getInstance().getScaleX();
            var scaleY = egret.StageDelegate.getInstance().getScaleY();
            this.div.scale.x = scaleX * x;
            this.div.scale.y = scaleY * y;
            this.div.transforms();
        };
        HTML5StageText.prototype.changePosition = function (x, y) {
            //            if (this._isShow) {
            var scaleX = egret.StageDelegate.getInstance().getScaleX();
            var scaleY = egret.StageDelegate.getInstance().getScaleY();
            this.div.position.x = x * scaleX;
            this.div.position.y = y * scaleY;
            this.div.transforms();
            //            }
        };
        HTML5StageText.prototype.setStyles = function () {
            //修改属性
            this.setElementStyle("fontStyle", this._italic ? "italic" : "normal");
            this.setElementStyle("fontWeight", this._bold ? "bold" : "normal");
            this.setElementStyle("textAlign", this._textAlign);
            this.setElementStyle("fontSize", this._size + "px");
            this.setElementStyle("color", "#000000");
            this.setElementStyle("width", this._width + "px");
            //            if (this._multiline) {
            this.setElementStyle("height", this._height + "px");
            //            }
            this.setElementStyle("border", "1px solid red");
            this.setElementStyle("display", "block");
        };
        /**
         * @method egret.StageText#add
         */
        HTML5StageText.prototype._show = function () {
            this.inputElement.setAttribute("maxlength", this._maxChars > 0 ? this._maxChars : -1);
            this._isShow = true;
            //打开
            var txt = this._getText();
            this.inputElement.value = txt;
            var self = this;
            this.inputElement.oninput = function () {
                self.textValue = self.inputElement.value;
                self.dispatchEvent(new egret.Event("updateText"));
            };
            this.setStyles();
            this.inputElement.focus();
            //            if (this._multiline) {
            this.inputElement.selectionStart = txt.length;
            this.inputElement.selectionEnd = txt.length;
            //            }
            if (this._shape && this._shape.parent == null) {
                egret.MainContext.instance.stage.addChild(this._shape);
            }
        };
        HTML5StageText.prototype._hide = function () {
            this._isShow = false;
            this.inputElement.oninput = function () {
            };
            this.setElementStyle("border", "none");
            this.setElementStyle("display", "none");
            //关闭
            this.inputElement.value = "";
            this.setElementStyle("width", 0 + "px");
            window.scrollTo(0, 0);
            var self = this;
            egret.setTimeout(function () {
                self.inputElement.blur();
                window.scrollTo(0, 0);
            }, this, 50);
            if (this._shape && this._shape.parent) {
                this._shape.parent.removeChild(this._shape);
            }
        };
        /**
         * @method egret.StageText#getText
         * @returns {string}
         */
        HTML5StageText.prototype._getText = function () {
            if (!this.textValue) {
                this.textValue = "";
            }
            return this.textValue;
        };
        /**
         * @method egret.StageText#setText
         * @param value {string}
         */
        HTML5StageText.prototype._setText = function (value) {
            this.textValue = value;
            this.resetText();
        };
        HTML5StageText.prototype.resetText = function () {
            if (this.inputElement) {
                this.inputElement.value = this.textValue;
            }
        };
        HTML5StageText.prototype._setWidth = function (value) {
            this._width = value;
        };
        HTML5StageText.prototype._setHeight = function (value) {
            this._height = value;
        };
        HTML5StageText.prototype.setElementStyle = function (style, value) {
            if (this.inputElement) {
                if (this._styleInfoes[style] != value) {
                    this.inputElement.style[style] = value;
                    this._styleInfoes[style] = value;
                }
            }
        };
        return HTML5StageText;
    })(egret.StageText);
    egret.HTML5StageText = HTML5StageText;
    HTML5StageText.prototype.__class__ = "egret.HTML5StageText";
})(egret || (egret = {}));
egret.StageText.create = function () {
    return new egret.HTML5StageText();
};









var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/**
 * Created by yang on 14/12/11.
 */
var HelloWorld = (function (_super) {
    __extends(HelloWorld, _super);
    function HelloWorld() {
        _super.call(this);
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }
    HelloWorld.prototype.onAddToStage = function (event) {
        egret.Profiler.getInstance().run();
    };
    return HelloWorld;
})(egret.DisplayObjectContainer);
HelloWorld.prototype.__class__ = "HelloWorld";

