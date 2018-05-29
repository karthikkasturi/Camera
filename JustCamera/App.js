import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Slider, Image, Vibration } from 'react-native';
import { RNCamera } from 'react-native-camera';
import SQLite from 'react-native-sqlite-storage';


const flashModeOrder = {
  off: 'on',
  on: 'auto',
  auto: 'torch',
  torch: 'off',
};

export default class CameraScreen extends React.Component {
  state = {
    flash: 'off',
    type: 'back',
    ratio: '16:9',
    images : [],
    isImageClicked : false,
    scanningBarCode : true
  };
 

  toggleFacing() {
    this.setState({
      type: this.state.type === 'back' ? 'front' : 'back',
    });
  }

  toggleFlash() {
    this.setState({
      flash: flashModeOrder[this.state.flash],
    });
  }

  setRatio(ratio) {
    this.setState({
      ratio,
    });
  }

  takePicture = async function() {
    if(this.camera) {
      console.log(1);
      this.camera.takePictureAsync(({width : '100%'}, {height : '100%'}, {fixOrientation : true})).then(data => {
        this.setState ( prevState => ({images : [...prevState.images, data], isImageClicked : true}))
        console.log(data);
      })
    }
  }


  renderImage(){
    if(this.state.isImageClicked)
    {
        console.log(this.state.images.length);
        return (
        <View>
          <View style = {{height : '100%', width : '100%'}}>
            <Image style = {{height : '90%', width : '100%', resizeMode : 'contain'}} source = {{ uri : this.state.images[this.state.images.length-1].uri.toString()}}/>
            <View style = {{alignContent : 'center', justifyContent : 'center'}}> 
              <TouchableOpacity style={[styles.flipButton, { flex: 0.1, alignSelf: 'center' , backgroundColor : 'white'}]} onPress = {()=>{this.setState({isImageClicked : false})}}>
                <Text> Back </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }
    else{
      return (
        <View></View>
      );
    }
  }

  handleBarCodeRead (e) {
    Vibration.vibrate();
    this.setState ({scanningBarCode : false});
  }

  renderCamera() {
    return (
      <RNCamera
        ref={ref => {
          this.camera = ref;
        }}
        style={{
          flex: 1,
        }}
        onBarCodeRead = {this.handleBarCodeRead.bind(this)}
        barCodeTypes={[RNCamera.Constants.BarCodeType.qr]}
        type={this.state.type}
        flashMode={this.state.flash}
        ratio={this.state.ratio}
        permissionDialogTitle={'Permission to use camera'}
        permissionDialogMessage={'We need your permission to use your camera phone'}
      >
        <View
          style={{
            flex: 0.5,
            backgroundColor: 'transparent',
            flexDirection: 'row',
            justifyContent: 'space-around',
          }}
        >
          <TouchableOpacity style={styles.flipButton} onPress={this.toggleFacing.bind(this)}>
            <Text style={styles.flipText}> FLIP </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.flipButton} onPress={this.toggleFlash.bind(this)}>
            <Text style={styles.flipText}> FLASH: {this.state.flash} </Text>
          </TouchableOpacity>
        </View>
        
        <View
          style={{
            flex: 0.5,
            backgroundColor: 'transparent',
            flexDirection: 'row',
            justifyContent : 'center',
          }}
        >

            <TouchableOpacity
              style={[styles.flipButton, styles.picButton, { flex: 0.3, alignSelf: 'flex-end', justifyContent :'center'}]}
              onPress={this.takePicture.bind(this)}
            >
              <Text style={styles.flipText}> SNAP </Text>
            </TouchableOpacity>
        </View>
      </RNCamera>
    
    );
  }

  render() {
    if(this.state.scanningBarCode===false)
    {
      return (
        <View style = {{flex : 1, justifyContent : 'center', alignItems : 'center', backgroundColor : 'rgba(221, 255, 194, 0.4)'}}>
          <Text style = {{fontSize : 35, alignSelf : 'center'}}>
            Code Scanned Successfully 
          </Text>

          <TouchableOpacity onPress = {()=>this.setState({scanningBarCode : true})} style = {{height : 20, width : 50 }}>
            <Text> BAcK </Text>
          </TouchableOpacity>
      </View>
      )
    }
    if(this.state.isImageClicked)
    {
      return (
        <View style = {styles.container}>
          {this.renderImage()}
        </View>
      )
    }
    return(
       <View style={styles.container}>
        {this.renderCamera()}
       </View>
       );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    height : '100%',
    width : '100%'
  },
  navigation: {
    flex: 1,
  },
  gallery: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  flipButton: {
    flex: 0.3,
    height: 40,
    marginHorizontal: 2,
    marginBottom: 10,
    marginTop: 20,
    borderRadius: 8,
    borderColor: 'white',
    borderWidth: 1,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flipText: {
    color: 'white',
    fontSize: 15,
  },
  picButton: {
    backgroundColor: 'darkseagreen',
  },
});
