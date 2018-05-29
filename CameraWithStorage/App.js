import React, {Component} from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Slider, Image, Vibration } from 'react-native';
import { RNCamera } from 'react-native-camera';

import SQLite from 'react-native-sqlite-storage';

const flashModeOrder = {
  off : 'on',
  on : 'auto',
  auto : 'torch',
  torch : 'off',
}
export default class App extends Component {
  constructor(props){
      super(props);
    this.state = {
      db : null,
      images : [],
      type: 'back',
      ratio: '16:9',
      isImageClicked : false,
      scanningBarCode : true,
      flash: 'off',
    }
  }
  async componentWillMount(){
    console.log("Component will mount");
    this.setState({db: await SQLite.openDatabase({name : 'sampleDb', location : 'library'}, ()=>{console.log("db opened")}, (error)=>{console.log("db not opened", error)})});
    // console.log(this.state.db);
    await this.state.db.transaction(async (tx)=>{
      await tx.executeSql('CREATE TABLE IF NOT EXISTS image ( id integer, data blob not null)',[],()=>{console.log("Talbe Created")}, (error)=>{console.log("table not created",error)});
    })
  }
  
  async AddImage(image){
    console.log("addImage");
    await this.state.db.transaction((tx)=>{
      tx.executeSql('INSERT INTO image (data) VALUES (?)', [image], ()=>{console.log('inserted')}, (error)=>{console.log('image not inserted', error)});
    })
  }
  toggleFacing(){
    this.setState({type : this.state.type === 'back'? 'front' : 'back'});
  }
  toggleFlash(){
    this.setState({flash : flashModeOrder[this.state.flash],});
  }
  takePicture = async function() {
    if(this.camera){
      console.log('take picture async');
      // const cameraData = await this.camera.takePictureAsync();
      // console.log("take Picture done");
      // this.setState({images : [...this.state.images, cameraData], isImageClicked : true});
      // console.log(this.state.images.length);
      await this.camera.takePictureAsync({fixOrientation : true},{height : '100%'}, {width : '100%'}).then(data => {
                                            console.log('.then');
                                            this.AddImage(data); 
                                            this.setState(prevState=>({
                                                            images : [...prevState.images, data],
                                                            isImageClicked : 'true'}))});
                            
    }
  }
  handleBarCodeRead (e) {
    Vibration.vibrate();
    this.setState ({scanningBarCode : false});
  }
  renderImage(){
    return (
      <View style = {{height : '100%', width : '100%'}}>
        <Image style = {{height : '90%', width : '100%', resizeMode : 'stretch'}} source = {{ uri : this.state.images[this.state.images.length-1].uri.toString()}}/>
        <View style = {{height : '100%', width : '100%'}}>
          <View style = {{alignContent : 'flex-end', justifyContent : 'flex-end'}}> 
            <TouchableOpacity style={[styles.flipButton, { flex: 0.1, alignSelf: 'center' , backgroundColor : 'white'}]} onPress = {()=>{this.setState({isImageClicked : false})}}>
              <Text> Back </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
  renderCamera(){
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


// export default class App extends React.Component {
//   constructor(props){
//     super(props);
//     this.state = {
//       db : null,
//       flash: 'off',
//       type: 'back',
//       ratio: '16:9',
//       images : [],
//       isImageClicked : false,
//       scanningBarCode : true,
//       db : null,
//     }
//     console.log("here");
//   }

//   async componentWillMount(){
//     this.setState({db: await SQLite.openDatabase({name: "sampleDb", location : 'library'}, ()=>{console.log(" db opened ")}, ()=>{console.log(" db not opened ")})})
//     console.log("componentwillMount");
//     this.state.db.transaction(async (tx)=>{
//       await tx.executeSql('CREATE TABLE IF NOT EXISTS number ( id integer primary key autoincrement, data blob not null)'),
//       ()=>{console.log("Table created successfully")},
//       (error)=>{console.lob("Error occured in create table :",error)}
//     })
//   }
 

//   async AddImage(image){
//     console.log('add image -', image);
//     console.log(typeof num)
//     console.log("addImage");
    // this.state.db.transaction((tx)=>{
    //   tx.executeSql("INSERT into number (data) values (?)",[image],()=>{console.log("Done")},(error)=> {console.log(error)})
    // })
//   }
 

//   toggleFacing() {
//     this.setState({
//       type: this.state.type === 'back' ? 'front' : 'back',
//     });
//   }

//   toggleFlash() {
//     this.setState({
//       flash: flashModeOrder[this.state.flash],
//     });
//   }

//   setRatio(ratio) {
//     this.setState({
//       ratio,
//     });
//   }

//   takePicture = async function() {
//     if(this.camera) {
//       console.log(1);
//       this.camera.takePictureAsync({width : '100%'}, {height : '100%'}, {fixOrientation : true}).then(data => {
//         this.setState ( (prevState) => ({images : [...prevState.images, data], isImageClicked : true}))
//         console.log(data);
//         this.AddImage(data);
//       })
//     }
//   }


//   renderImage(){
//     if(this.state.isImageClicked)
//     {
//         console.log(this.state.images.length);
//         return (
//         <View>
//           <View style = {{height : '100%', width : '100%'}}>
//             <Image style = {{height : '90%', width : '100%', resizeMode : 'contain'}} source = {{ uri : this.state.images[this.state.images.length-1].uri.toString()}}/>
//             <View style = {{alignContent : 'center', justifyContent : 'center'}}> 
//               <TouchableOpacity style={[styles.flipButton, { flex: 0.1, alignSelf: 'center' , backgroundColor : 'white'}]} onPress = {()=>{this.setState({isImageClicked : false})}}>
//                 <Text> Back </Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       );
//     }
//     else{
//       return (
//         <View></View>
//       );
//     }
//   }

//   handleBarCodeRead (e) {
//     Vibration.vibrate();
//     this.setState ({scanningBarCode : false});
//   }

//   renderCamera() {
//     return (
//       <RNCamera
//         ref={ref => {
//           this.camera = ref;
//         }}
//         style={{
//           flex: 1,
//         }}
//         onBarCodeRead = {this.handleBarCodeRead.bind(this)}
//         barCodeTypes={[RNCamera.Constants.BarCodeType.qr]}
//         type={this.state.type}
//         flashMode={this.state.flash}
//         ratio={this.state.ratio}
//         permissionDialogTitle={'Permission to use camera'}
//         permissionDialogMessage={'We need your permission to use your camera phone'}
//       >
//         <View
//           style={{
//             flex: 0.5,
//             backgroundColor: 'transparent',
//             flexDirection: 'row',
//             justifyContent: 'space-around',
//           }}
//         >
//           <TouchableOpacity style={styles.flipButton} onPress={this.toggleFacing.bind(this)}>
//             <Text style={styles.flipText}> FLIP </Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.flipButton} onPress={this.toggleFlash.bind(this)}>
//             <Text style={styles.flipText}> FLASH: {this.state.flash} </Text>
//           </TouchableOpacity>
//         </View>
        
//         <View
//           style={{
//             flex: 0.5,
//             backgroundColor: 'transparent',
//             flexDirection: 'row',
//             justifyContent : 'center',
//           }}
//         >

//             <TouchableOpacity
//               style={[styles.flipButton, styles.picButton, { flex: 0.3, alignSelf: 'flex-end', justifyContent :'center'}]}
//               onPress={this.takePicture.bind(this)}
//             >
//               <Text style={styles.flipText}> SNAP </Text>
//             </TouchableOpacity>
//         </View>
//       </RNCamera>
    
//     );
//   }

//   render() {
//     if(this.state.scanningBarCode===false)
//     {
//       return (
//         <View style = {{flex : 1, justifyContent : 'center', alignItems : 'center', backgroundColor : 'rgba(221, 255, 194, 0.4)'}}>
//           <Text style = {{fontSize : 35, alignSelf : 'center'}}>
//             Code Scanned Successfully 
//           </Text>

//           <TouchableOpacity onPress = {()=>this.setState({scanningBarCode : true})} style = {{height : 20, width : 50 }}>
//             <Text> BAcK </Text>
//           </TouchableOpacity>
//       </View>
//       )
//     }
//     if(this.state.isImageClicked)
//     {
//       return (
//         <View style = {styles.container}>
//           {this.renderImage()}
//         </View>
//       )
//     }
//     return(
//        <View style={styles.container}>
//         {this.renderCamera()}
//        </View>
//        );
//   }
// }

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




