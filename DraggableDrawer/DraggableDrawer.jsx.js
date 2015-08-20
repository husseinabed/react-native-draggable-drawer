
'use strict'

var React = require('react-native');
var rebound = require('rebound');

var Dimensions = require('Dimensions');
var SCREEN_HEIGHT = Dimensions.get('window').height;
var DraggableDrawerHelper = require('./helpers/DraggableDrawerHelper')(SCREEN_HEIGHT);

var TENSION = 800;
var FRICTION = 90;


var {
  AppRegistry,
  StyleSheet,
  Text,
  Image,
  View,
  PanResponder  
} = React;


var component = React.createClass({

  getInitialState: function() {
    // naming it initialX clearly indicates that the only purpose
    // of the passed down prop is to initialize something internally    
      var initialDrawerSize = DraggableDrawerHelper.calculateInitialPosition(this.props.initialDrawerSize);
      return {position: initialDrawerSize };
  },

  onUpdatePosition: function (position){

    this.setState({position: position });
    this._previousTop = position;

    var initialPosition = DraggableDrawerHelper.getInitialPosition();
   

    if( initialPosition === position){
       this.props.onInitialPositionReached && this.props.onInitialPositionReached();
    }

  },

  componentWillMount: function() {   

     // Initialize the DraggableDrawerHelper that will drive animations
      DraggableDrawerHelper.setupAnimation(TENSION,FRICTION,
                (position) => {
                 
                  if (!this.center) return;
                     this.onUpdatePosition(position);                  
                }
      );


      this._panGesture = PanResponder.create({

      onMoveShouldSetPanResponder: (evt, gestureState) => {
         return  DraggableDrawerHelper.isAValidMovement(gestureState.dx,gestureState.dy);      
      },

      onPanResponderMove: (evt, gestureState) => this.moveDrawerView(gestureState),
      onPanResponderRelease: (evt, gestureState) => this.moveFinished(gestureState),
    })
  },


  moveDrawerView: function(gestureState) {
    
    if (!this.center) return;
    
    var currentValue = Math.abs(gestureState.moveY / SCREEN_HEIGHT);
    var isGoingToUp = ( gestureState.vy < 0 )? true : false; 

    //Here, I'm subtracting %5 of screen size from edge drawer position to be closer as possible to finger location when dragging the drawer view
    var position = gestureState.moveY - SCREEN_HEIGHT * 0.05;
      
    //Send to callback function the current drawer position when drag down the drawer view component
    if(!isGoingToUp) this.props.onDragDown(1-currentValue);

    this.onUpdatePosition(position);   

       

  },

  moveFinished: function(gestureState) {

     if (!this.center) return;
     DraggableDrawerHelper.startAnimation(gestureState.vy,gestureState.moveY);

     var isGoingToUp = ( gestureState.vy < 0 )? true : false; 
     
     console.log(' move Finished ');
     this.props.onRelease(isGoingToUp);



  },

  render: function() {
    var containerView = this.props.renderContainerView ? this.props.renderContainerView() : null;
    var drawerView = this.props.renderDrawerView ? this.props.renderDrawerView() : null;
    
   var drawerPosition = {
      transform: [{translateY: this.state.position}],
    };
      
    return (
      <View style={styles.viewport}>
       
         <View style={styles.container}>
          {containerView}
         </View>        
    
        <View
          style={[drawerPosition, styles.drawer]}
          ref={(center) => this.center = center}
          {...this._panGesture.panHandlers}>
          {drawerView}
        </View>
      </View>
    )
  },
});


var styles = StyleSheet.create({

  viewport: {
    flex: 1,
    margin: 20,
    backgroundColor: '#22aaff',

  },
  drawer: {
    flex:1,
    backgroundColor: '#0088ff',
  },
  container: {
     position: 'absolute',
     top:0,
     left:0,
     bottom: 0,
     right: 0,
     backgroundColor: '#aacccc',
  },
  
});



module.exports = component;