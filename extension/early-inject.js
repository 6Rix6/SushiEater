// すべての getContext 呼び出しで preserveDrawingBuffer を true に強制
(() => {
    var getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(){
      if( arguments[ 1 ] ) arguments[ 1 ].preserveDrawingBuffer = true;
      var context = getContext.apply( this, arguments );
      return context;
    }
    console.log("early-inject has been loaded.")
})();
