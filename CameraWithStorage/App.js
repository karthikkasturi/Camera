import React, { Component } from 'react';
import { ImageBackground, StyleSheet, Text, View, TouchableOpacity, TouchableWithoutFeedback, TouchableHighlight, Slider, Image, Vibration } from 'react-native';

import { RNCamera } from 'react-native-camera';

import SQLite from 'react-native-sqlite-storage';

import SketchView from 'react-native-sketch-view';

import ViewShot, { captureRef } from 'react-native-view-shot'


const flashModeOrder = {
  off: 'on',
  on: 'auto',
  auto: 'torch',
  torch: 'off',
}

console.ignoredYellowBox = ['Remote debugger']

const sketchViewConstants = SketchView.constants;

const tools = {};

tools[sketchViewConstants.toolType.pen.id] = {
  id: sketchViewConstants.toolType.pen.id,
  name: sketchViewConstants.toolType.pen.name,
  nextId: sketchViewConstants.toolType.eraser.id
};
tools[sketchViewConstants.toolType.eraser.id] = {
  id: sketchViewConstants.toolType.eraser.id,
  name: sketchViewConstants.toolType.eraser.name,
  nextId: sketchViewConstants.toolType.pen.id
};


export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      db: null,
      editingImage: '',
      type: 'back',
      ratio: '16:9',
      isImageClicked: false,
      scanningBarCode: true,
      flash: 'off',
      toolSelected: sketchViewConstants.toolType.pen.id,
      isImageSaved: false,
      editedImage: '',
      isImageSaving: false,
      toolColor: '#b22222',
      colors: ['#b22222', '#f1f2f2', '#063852', '#258039' ],
      toolThickness: 5,
    }
    this.changeToolColor = (color) => {
      return () => {
        if(this.isEraserToolSelected()) this.toolChangeClick()
        this.setState({toolColor: color})
      }
    }
  }

  isEraserToolSelected() {
    return this.state.toolSelected === sketchViewConstants.toolType.eraser.id;
  }

  toolChangeClick() {
    var thickness = this.isEraserToolSelected() ? 5 : 20
    this.setState({ toolSelected: tools[this.state.toolSelected].nextId, toolThickness : thickness });
  }

  getToolName() {
    return tools[this.state.toolSelected].name;
  }

  async componentWillMount() {
    console.log("Component will mount");
    this.setState({ db: await SQLite.openDatabase({ name: 'sampleDb', location: 'library' }, () => { console.log("db opened") }, (error) => { console.log("db not opened", error) }) });
    await this.state.db.transaction(async (tx) => {
      await tx.executeSql('CREATE TABLE IF NOT EXISTS image ( id integer, data blob not null)', [], () => { console.log("Talbe Created") }, (error) => { console.log("table not created", error) });
    })
  }

  async AddImage(image) {
    console.log("addImage");
    await this.state.db.transaction((tx) => {
      tx.executeSql('INSERT INTO image (data) VALUES (?)', [image], () => { console.log('inserted') }, (error) => { console.log('image not inserted', error) });
    })
  }

  toggleFacing() {
    this.setState({ type: this.state.type === 'back' ? 'front' : 'back' });
  }
  toggleFlash() {
    this.setState({ flash: flashModeOrder[this.state.flash], });
  }
  takePicture = async function () {
    if (this.camera) {
      console.log('take picture async');
      await this.camera.takePictureAsync({ fixOrientation: true, base64: true }, { height: '100%' }, { width: '100%' })
        .then(data => {
          let base64data = 'data:image/png;base64,' + data.base64
          console.log(base64data)
          this.setState(prevState => ({
            editingImage: base64data,
            isImageClicked: 'true'
          }))
        });

    }
  }

  saveSketchView = () => {
    this.setState( {...this.state, isImageSaving: true })
    setImmediate( () => {
      captureRef(this.refs.img, { format: "png", quality: 0.9, result: "base64" })
        .then(uri => {
          this.setState({ ...this.state, isImageSaved: true, editedImage: 'data:image/png;base64,' + uri })
        }) 
    })

  }

  handleBarCodeRead(e) {
    Vibration.vibrate();
    this.setState({ scanningBarCode: false });
  }
  
  renderColorPicker() {
    return (
      <View style = {{position: 'absolute', width: 40, backgroundColor: 'transparent', alignContent: 'center', alignItems: 'center',
        alignSelf: 'flex-end'}}>
      {        
        this.state.colors.map((color, index) => {
          return(
          <TouchableWithoutFeedback key = {index} style={{ 
              width: 30,
              height: 30,
              borderRadius: 30, 
              justifyContent: 'center', alignItems: 'center', 
              backgroundColor: color,
              borderWidth: color === this.state.toolColor ? 3 : 0 , 
              margin: 5,
              borderColor: color === '#f1f2f2' ? 'black' : 'white'}}
            onPress = {this.changeToolColor(color)}>
            <View style={{ 
              width: 30,
              height: 30,
              borderRadius: 30, 
              justifyContent: 'center', alignItems: 'center', 
              backgroundColor: color,
              borderWidth: color === this.state.toolColor ? 3 : 0 , 
              margin: 5,
              borderColor: color === '#f1f2f2' ? 'black' : 'white'}}></View>
          </TouchableWithoutFeedback>
          )
        })
      } 
      <TouchableOpacity style={{ 
          width: 30,
          height: 30,
          borderRadius: 30, 
          justifyContent: 'center', alignItems: 'center', 
          backgroundColor: 'white',
          borderWidth: this.isEraserToolSelected() ? 3 : 0 , 
          margin: 5,
          borderColor: 'black'}}
          onPress={this.toolChangeClick.bind(this) } >
      <Image source = {require('./eraser_icon.png')} style = {{width:20, height: 20}} />
      </TouchableOpacity>
      </View>
    )
  }


  renderImage() {
    console.log(this.state.toolThickness)
    return (
      <View style={{ flex: 1, flexDirection: 'column' }}>
        
        <View ref="img" style={{ backgroundColor: 'transparent', flex: 1 }}  >
          <ImageBackground source={{ uri: this.state.editingImage }} style={{ flex: 1 }} >
            <SketchView toolThickness = {this.state.toolThickness} toolColor = {this.state.toolColor} style={{ flex: 1, backgroundColor: 'transparent' }} ref="sketchRef"
            selectedTool={this.state.toolSelected}/>
          </ImageBackground>
          { 
            !this.state.isImageSaving &&  
            this.renderColorPicker()
          }
        </View>
        <View style={{ flexDirection: 'row', backgroundColor: '#EEE' }}>
          <TouchableOpacity underlayColor={"#CCC"} style={{ flex: 1, alignItems: 'center', paddingVertical: 20 }} onPress={() => { this.setState({isImageClicked: false}) }}>
            <Text style={{ color: '#888', fontWeight: '600' }}>RETAKE</Text>
          </TouchableOpacity>
          <TouchableOpacity underlayColor={"#CCC"}
           style={{ flex: 1, alignItems: 'center', paddingVertical: 20, borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#DDD' }} 
           onPress={ () =>{ this.refs.sketchRef.clearSketch()}}>
            <Text style={{ color: '#888', fontWeight: '600' }}>CLEAR</Text>
          </TouchableOpacity>
          <TouchableOpacity underlayColor={"#CCC"} style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}} onPress={this.saveSketchView}>
            <Text style={{ color: '#888', fontWeight: '600' }}>SAVE</Text>
          </TouchableOpacity>
        </View>
      </View>

    );
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
            justifyContent: 'center',
          }}
        >
          <TouchableOpacity
            style={[styles.flipButton, styles.picButton, { flex: 0.3, alignSelf: 'flex-end', justifyContent: 'center' }]}
            onPress={this.takePicture.bind(this)}
          >
            <Text style={styles.flipText}> SNAP </Text>
          </TouchableOpacity>
        </View>
      </RNCamera>
    );
  }
  render() {
    if (this.state.scanningBarCode === false) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(221, 255, 194, 0.4)' }}>
          <Text style={{ fontSize: 35, alignSelf: 'center' }}>
            Code Scanned Successfully
          </Text>
          <TouchableOpacity onPress={() => this.setState({ scanningBarCode: true })} style={{ height: 20, width: 50 }}>
            <Text> BACK </Text>
          </TouchableOpacity>
        </View>
      )
    }
    if (this.state.isImageSaved) {
      return (
        <Image source={{ uri: this.state.editedImage }} style={{ flex: 1, width: '100%' }} />
      )
    }
    if (this.state.isImageClicked) {
      return (
        <View style={styles.container}>
          {this.renderImage()}
        </View>
      )
    }
    return (
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
    height: '100%',
    width: '100%'
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
  saveButton: {
    width: '20%',
    height: 40,
    marginHorizontal: 2,
    marginBottom: 20,
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




