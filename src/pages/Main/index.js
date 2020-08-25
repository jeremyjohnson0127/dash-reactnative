import React from 'react';
import {
  View,
  Text,
  StatusBar,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  Animated,
  Dimensions,
  FlatList,
  TouchableHighlight,
  Platform,
  ImageBackground,
  ActivityIndicator,

} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Actions } from 'react-native-router-flux';
import WorkoutCell from '../../components/WorkoutCell';
import WorkoutCollapsedCell from '../../components/WorkoutCollapsedCell';
import WorkoutRestCell from '../../components/WorkoutRestCell';
import WorkoutIntroCell from '../../components/WorkoutIntroCell';
import WorkoutCompleteCell from '../../components/WorkoutCompleteCell';
// import { NavigationContainer } from '@react-navigation/native';
// import { createStackNavigator } from '@react-navigation/stack';
import * as planActions from '../../actions/plans';
import { mediaHost } from '../../config';
import AsyncStorage from '@react-native-community/async-storage';
import { BackArrow } from 'dash/src/components/Icons';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";

console.disableYellowBox = true;
export const SCREEN_HEIGHT = Dimensions.get('window').height;
export const SCREEN_WIDTH = Dimensions.get('window').width;
export const SCREEN_SCALE = Dimensions.get('window').scale;
export const DEFAULT_WINDOW_MULTIPLIER = 0.5;
export const DEFAULT_NAVBAR_HEIGHT = 65;
const thumbnail_rest_inside_circuit = require('../../res/workout/rest_inside_circuit.png');
const bgimage_rest_inside_circuit = require('../../res/workoutimage.png');
const thumbnail_rest_outside_circuit = require('../../res/workout/rest_outside_circuit.png');
const thumbnail_note_card = require('../../res/workout/note_thumbnail.png');
const thumbnail_old = require('../../res/list_image.png');

// TODO: this needs major clean up

// const Stack = createStackNavigator();

export default class App extends React.Component {

  constructor() {
    super();
    this.state = {
      show: true,
      isSwitchOn: true,
      isCoolDownSwitchOn: true,
      showCoolDown: true,
      showReplaceExcercise: false,
      showPyramidSet: false,
      showDetail: false,
      showComplete: false,
      ReplaceExcerciseSelectedItem: 1,
      scrollY: new Animated.Value(0),
      dictTaskDescription: {},
      loading: false,
      storiesArray: [],
      arrayVersionTask: [],
    };
    this.arrayTasks = [];
    this.arraySingleTask = [];
    this.userSelectedVersion = '';
    this.exerciseCardArray = [];
  }

  componentDidMount = () => {
    this.getAllTasksOfPlan();
  }

  getVersion = async () => {
    let version = '';
    try {
      this.userSelectedVersion = await AsyncStorage.getItem('version');

    } catch (error) {
      // Error retrieving data

    }
    return version;
  }

  scrollTo(where) {
    if (!this._scrollView) return;
    this._scrollView.scrollTo(where);
  }

  ShowHideComponent = () => {
    if (this.state.show == true) {
      this.setState({ show: false });
    } else {
      this.setState({ show: true });
    }
  };

  ChangeSwitch = () => {
    if (this.state.isSwitchOn == true) {
      this.setState({ isSwitchOn: false });
    } else {
      this.setState({ isSwitchOn: true });
    }
  };
  ShowCoolDownHideComponent = () => {
    if (this.state.showCoolDown == true) {
      this.setState({ showCoolDown: false });
    } else {
      this.setState({ showCoolDown: true });
    }
  };

  ChangeCoolDownSwitch = () => {
    if (this.state.isCoolDownSwitchOn == true) {
      this.setState({ isCoolDownSwitchOn: false });
    } else {
      this.setState({ isCoolDownSwitchOn: true });
    }
  };

  getAllTasksOfPlan = async () => {
    if (this.props.challenge && this.props.challenge.PlanID) {

      this.setState({ loading: true });
      const arrayResponse = await planActions.getPlanTasks(this.props.challenge.PlanID);
      // this.setState({ loading: false });

      for (let index = 0; index < arrayResponse.planTypeData.length; index++) {
        const element = arrayResponse.planTypeData[index];
        //  get the data of user preselected version.
        if (element.version === this.props.challenge.Version) {
          this.arrayTasks = element.versionData[0].planVersionDayTaskData;
          this.setState({ dictTaskDescription: element.versionData[0].planVersionDayTaskData[0] });
          break;
        }
      }
      if (this.arrayTasks.length > 0) {
        this.setState({ dictTaskDescription: this.arrayTasks[0] });
        this.initializeData();
      }
    }
  }
  getExerciseInformation = async (cardId) => {
    const arrayResponse = await planActions.getExerciseData(cardId)
    return arrayResponse;
  }

  timeoutStories = null;
  initializeData = async () => {
    let dayTasks = this.arrayTasks;
    let dataTask1 = dayTasks[0];
    this.setState({ arrayVersionTask: dataTask1 });
    let stories = [];
    let userDisplayName = this.props.navigation.state.params.user && this.props.navigation.state.params.user.displayname ? this.props.navigation.state.params.user.displayname : '';


    //  Getting videos and set them in the story 
    for (let index = 0; index < dataTask1.versionDayTaskCard.length; index++) {

      const element = dataTask1.versionDayTaskCard[index];
      let arrayCircuitVideos = [];
      let arrayVideoTimerCircuit = []; // gett the original video time   
      let arrayNormalVideos = [];
      let arrayVideoTimerNormal = [];

      if (element.flag === "circuit") {
        for (let index = 0; index < element.exeerciseCards.length; index++) {
          const temp = element.exeerciseCards[index];

          if (temp.flag === "video" && temp.fileName) {
            let dict = {
              'title': temp.title,
              'description': temp.description,
              'fileName': temp.fileName ? temp.fileName : '',
              'AutoPlay': temp.AutoPlay == 'checked' ? true : false,
              'AutoPlayShowFlag': temp.AutoPlayShowFlag ? temp.AutoPlayShowFlag : true,
              'flag': temp.flag,
              'RestTime': temp.RestTime,
              'timer': false,
              "cardType": "video"
            }
            arrayCircuitVideos.push(dict);
            // const timer = temp.RestTime != "" ? temp.RestTime : 15;
            // arrayVideoTimerCircuit.push(timer);

          }
          else if (temp.flag === "rest") {
            let dict = {
              'title': temp.title,
              'description': temp.description,
              'flag': temp.flag,
              'thumbnailImage': bgimage_rest_inside_circuit,
              'RestTime': temp.RestTime,
              'timer': false,
              'cardType': 'rest',
              'AutoPlayShowFlag': temp.AutoPlayShowFlag ? temp.AutoPlayShowFlag : '',
              'AutoPlay': temp.AutoPlay == 'checked' ? true : false,
            }
            arrayCircuitVideos.push(dict);
          }
          else if (temp.flag === "note") {
            let dict = {
              'title': temp.title,
              'description': temp.description,
              'flag': temp.flag,
              'thumbnailImage': thumbnail_note_card,
              'RestTime': temp.RestTime,
              'timer': false,
              'cardType': 'note',
              'AutoPlayShowFlag': temp.AutoPlayShowFlag ? temp.AutoPlayShowFlag : '',
              'AutoPlay': false,
            }
            arrayCircuitVideos.push(dict);
          }
          else if (temp.flag === "exercise") {
            await this.getExerciseInformation(temp.cardUUID).then((exResponse) => {
              if (exResponse.exercisesData) {
                const cardData = exResponse.exercisesData.filter(data => data.id === temp.cardExerciseID);
                if (cardData.length) {
                  const {
                    BaseAudio_fileName,
                    BaseThumbnail_fileName,
                    BaseVideo_fileName,
                    EasierAudio_fileName,
                    EasierExerciseDescription,
                    EasierExerciseName,
                    EasierVideo_fileName,
                    HardAudio_fileName,
                    HardExerciseDescription,
                    HardExerciseName,
                    HardVideo_fileName,
                    audioTag,
                    exerciseDescription,
                    exerciseName,
                    exerciseTag,
                    id,
                  } = cardData[0];

                  let arrData = {
                    'title': exerciseName ? exerciseName : '',
                    'description': exerciseDescription ? exerciseDescription : '',
                    'fileName': BaseVideo_fileName ? BaseVideo_fileName : '',
                    'AutoPlayShowFlag': false,
                    'flag': 'video',
                    'RestTime': temp.RestTime,
                    'cardType': 'exercise',
                    'Reps': temp.Reps,
                    "Sets": temp.Sets,
                    'RepsCount': temp.RepsCount,
                    'AutoPlay': temp.AutoPlay == 'checked' ? true : false,
                  }
                  arrayCircuitVideos.push(arrData);
                  this.exerciseCardArray.push(cardData[0]);
                }

                // for (let index = 0; index < exResponse.exercisesData.length; index++) {
                //   const dict1 = exResponse.exercisesData[index];
                //   if (dict1.EasierVideo_fileName && dict1.EasierVideo_fileName != "") {
                //     let dict = {
                //       'title': dict1.exerciseName,
                //       'description': dict1.exerciseDescription,
                //       'fileName': dict1.EasierVideo_fileName ? dict1.EasierVideo_fileName : '',
                //       "AutoPlay": false,
                //       "AutoPlayShowFlag": false,
                //       'flag': 'video',
                //       'RestTime': temp.RestTime,
                //       "cardType" :"exercise"
                //     }
                //     console.log("arrayCircuitVideos===================>",arrayCircuitVideos);
                //     arrayCircuitVideos.push(dict);
                //     // const timer = temp.RestTime != "" ? temp.RestTime : 15;
                //     // arrayVideoTimerCircuit.push(timer);

                //   }
                // }
              }
            });
          }
        }
        const pushData = {
          id: '2',
          source: require('dash/src/res/friends/friend1.png'),
          user: userDisplayName,
          avatar: require('dash/src/res/friends/friend1.png'),
          timer: arrayVideoTimerCircuit,
          videos: arrayCircuitVideos,
          flag: 'circuit'
        };
        stories.push(pushData);

      } else {

        if (element.flag === "exercise") {
          await this.getExerciseInformation(element.cardUUID).then((exResponse1) => {
            if (exResponse1.exercisesData) {
              const cardData = exResponse1.exercisesData.filter(data => data.id === element.cardExerciseID);
              if (cardData.length) {
                const {
                  BaseAudio_fileName,
                  BaseThumbnail_fileName,
                  BaseVideo_fileName,
                  EasierAudio_fileName,
                  EasierExerciseDescription,
                  EasierExerciseName,
                  EasierVideo_fileName,
                  HardAudio_fileName,
                  HardExerciseDescription,
                  HardExerciseName,
                  HardVideo_fileName,
                  audioTag,
                  exerciseDescription,
                  exerciseName,
                  exerciseTag,
                  id,
                } = cardData[0];

                let arrData = {
                  'title': exerciseName ? exerciseName : '',
                  'description': exerciseDescription ? exerciseDescription : '',
                  'fileName': BaseVideo_fileName ? BaseVideo_fileName : '',
                  'AutoPlayShowFlag': false,
                  'flag': 'video',
                  'RestTime': element.RestTime,
                  'cardType': 'exercise',
                  'Reps': element.Reps,
                  'Sets': element.Sets,
                  'RepsCount': element.RepsCount,
                  'AutoPlay': element.AutoPlay == 'checked' ? true : false,
                }
                arrayNormalVideos.push(arrData);
                this.exerciseCardArray.push(cardData[0]);
              }
              // for (let index = 0; index < exResponse1.exercisesData.length; index++) {
              //   let dict = exResponse1.exercisesData[index];
              //   let pushData = {
              //     'title': dict.exerciseName,
              //     'description': dict.exerciseDescription,
              //     'fileName': dict.EasierVideo_fileName ? dict.EasierVideo_fileName : '',
              //     "AutoPlay": false,
              //     "AutoPlayShowFlag": false,
              //     'flag': 'video',
              //     'timer': false,
              //     "Reps": dict.Reps ? dict.Reps : "",
              //     "Sets": dict.Sets ? dict.Sets : "",
              //     "RepsCount": dict.RepsCount ? dict.RepsCount : "",
              //     'RestTime': element.RestTime,
              //     "cardType": "exercise"
              //   }
              //   arrayNormalVideos.push(pushData);
              // }
            }
          });
        }
        else if (element.flag === "video" && element.fileName) {
          let dict = {
            'title': element.title,
            'description': element.description,
            'fileName': element.fileName ? element.fileName : '',
            'AutoPlay': element.AutoPlay == 'checked' ? true : false,
            'AutoPlayShowFlag': element.AutoPlayShowFlag ? element.AutoPlayShowFlag : '',
            'RestTime': element.RestTime,
            'timer': false,
            'flag': element.flag,
            'cardType': 'video'
          }

          arrayNormalVideos.push(dict);
          // const timer = element.RestTime != "" ? element.RestTime : 15;
          // arrayVideoTimerNormal.push(timer);

        } else if (element.flag === 'note') {
          let dict = {
            'title': element.title,
            'description': element.description,
            'flag': element.flag,
            'thumbnailImage': thumbnail_note_card,
            'RestTime': element.RestTime,
            'timer': false,
            'cardType': 'note',
            'AutoPlayShowFlag': element.AutoPlayShowFlag ? element.AutoPlayShowFlag : '',
            'AutoPlay': false,

          }
          arrayNormalVideos.push(dict);

          // const timer = element.RestTime != "" ? element.RestTime : 15;
          // arrayVideoTimerNormal.push(timer);

        }
        else if (element.flag === "rest") {
          let dict = {
            'title': element.title,
            'description': element.description,
            'flag': element.flag,
            'thumbnailImage': thumbnail_rest_outside_circuit,
            'RestTime': element.RestTime,
            'title': element.title,
            'timer': true,
            "cardType": "rest",
            'AutoPlayShowFlag': element.AutoPlayShowFlag ? element.AutoPlayShowFlag : '',
            'AutoPlay': element.AutoPlay == 'checked' ? true : false,
          }
          arrayNormalVideos.push(dict);

          const timer = element.RestTime != "" ? element.RestTime : 15;
          arrayVideoTimerNormal.push(timer);

        }

        if (arrayNormalVideos.length) {
          const pushData = {
            id: '4',
            source: require('dash/src/res/friends/friend1.png'),
            user: userDisplayName,
            avatar: require('dash/src/res/friends/friend1.png'),
            timer: arrayVideoTimerNormal,
            videos: arrayNormalVideos,
            flag: 'solo'
          };
          stories.push(pushData);
        }
      }
    }

    clearTimeout(this.timeoutStories);
    this.timeoutStories = setTimeout(() => {
      this.setState({
        storiesArray: stories,
        loading: false
      });
    }, 2000);
  }

  renderReplaceExcercise() {
    return (
      <Modal
        animationType="slide"
        visible={this.state.showReplaceExcercise}
        onRequestClose={() => this.setState({ showReplaceExcercise: false })}
        transparent>
        <View style={styles.modalContainer}>
          <View
            style
            style={{
              flexDirection: 'column',
              backgroundColor: '#FFFFFF',
              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,
              marginTop: 33,
            }}>
            <View
              style
              style={{
                marginTop: 26,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  fontFamily: 'Poppins-Medium',
                  color: '#25292E',
                  marginLeft: 16,
                  fontWeight: 'bold',
                  fontSize: 20,
                  lineHeight: 28,
                  fontWeight: '600',
                }}>
                Replace Excercise
              </Text>
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  left: 0,
                  height: 48,
                  width: 48,
                  justifyContent: 'center',
                  backgroundColor: '',
                }}
                onPress={() => {
                  this.setState({ showReplaceExcercise: false });
                }}>
                <Image
                  source={require('../../res/close.png')}
                  style={{ height: 13, width: 13, marginLeft: 16 }}></Image>
              </TouchableOpacity>
            </View>
            <View
              style={{
                borderBottomColor: '#F0F5FA',
                borderBottomWidth: 1,
                marginTop: 31,
              }}
            />

            <View style={{ marginTop: 26, marginLeft: 16, marginRight: 16 }}>
              <TouchableOpacity
                onPress={() =>
                  this.setState({ ReplaceExcerciseSelectedItem: 1 })
                }>
                <View style={{ flexDirection: 'row' }}>
                  <View>
                    <Image
                      style={{
                        width: 72,
                        height: 72,
                        marginLeft: 16,
                        marginTop: 11,
                      }}
                      source={require('../../res/list_image.png')}
                    />
                  </View>

                  <View
                    style={{
                      marginLeft: 16,
                      flexDirection: 'column',
                      marginTop: 11,
                      alignSelf: 'center',
                    }}>
                    <Text
                      style={{
                        color: '#292E3A',
                        fontSize: 16,
                        fontFamily: 'Poppins-Medium',
                        fontWeight: '600',
                        lineHeight: 24,
                      }}>
                      Swiss Ball Torso Twist
                    </Text>

                    <View style={{ flexDirection: 'row' }}>
                      <Text
                        style={{
                          color: '#1AA0FF',
                          fontSize: 15,
                          fontFamily: 'Poppins-Medium',
                          fontWeight: '600',
                          lineHeight: 24,
                        }}>
                        Base
                      </Text>
                    </View>
                  </View>

                  {this.state.ReplaceExcerciseSelectedItem == 1 ? (
                    <View
                      style={{
                        marginLeft: 16,
                        marginTop: 11,
                        height: 20,
                        flex: 1,
                        alignItems: 'flex-end',
                        marginRight: 16,
                        alignSelf: 'center',
                      }}>
                      <LinearGradient
                        colors={['rgba(0,123,255, 1)', 'rgba(0,161,255, 1)']}
                        start={{ x: 0, y: 1 }}
                        end={{ x: 1, y: 1 }}
                        useAngle
                        angle={189.97}
                        style={{ height: 26, width: 26, borderRadius: 13 }}>
                        <Image
                          style={{ height: 24, width: 24 }}
                          source={require('../../res/tick.png')}
                          resizeMode="center"
                        />
                      </LinearGradient>
                    </View>
                  ) : null}
                </View>
              </TouchableOpacity>
              <View
                style={{
                  marginLeft: 16,
                  marginRight: 16,
                  borderBottomColor: '#F0F5FA',
                  borderBottomWidth: 1,
                  marginTop: 16,
                  marginBottom: 16,
                }}
              />
              <TouchableOpacity
                onPress={() =>
                  this.setState({ ReplaceExcerciseSelectedItem: 2 })
                }>
                <View style={{ flexDirection: 'row' }}>
                  <View>
                    <Image
                      style={{
                        width: 72,
                        height: 72,
                        marginLeft: 16,
                        marginTop: 11,
                      }}
                      source={require('../../res/list_image.png')}
                    />
                  </View>

                  <View
                    style={{
                      marginLeft: 16,
                      flexDirection: 'column',
                      marginTop: 11,
                      alignSelf: 'center',
                    }}>
                    <Text
                      style={{
                        color: '#292E3A',
                        fontSize: 16,
                        fontFamily: 'Poppins-Medium',
                        fontWeight: '600',
                        lineHeight: 24,
                      }}>
                      Swiss Ball Torso Twist
                    </Text>

                    <View style={{ flexDirection: 'row' }}>
                      <Text
                        style={{
                          color: '#96AAC6',
                          fontSize: 15,
                          fontFamily: 'Poppins-Medium',
                          fontWeight: '600',
                          lineHeight: 24,
                        }}>
                        Advanced
                      </Text>
                    </View>
                  </View>

                  {this.state.ReplaceExcerciseSelectedItem == 2 ? (
                    <View
                      style={{
                        marginLeft: 16,
                        marginTop: 11,
                        height: 20,
                        flex: 1,
                        alignItems: 'flex-end',
                        marginRight: 16,
                        alignSelf: 'center',
                      }}>
                      <LinearGradient
                        colors={['rgba(0,123,255, 1)', 'rgba(0,161,255, 1)']}
                        start={{ x: 0, y: 1 }}
                        end={{ x: 1, y: 1 }}
                        useAngle
                        angle={189.97}
                        style={{ height: 26, width: 26, borderRadius: 13 }}>
                        <Image
                          style={{ height: 24, width: 24 }}
                          source={require('../../res/tick.png')}
                          resizeMode="center"
                        />
                      </LinearGradient>
                    </View>
                  ) : null}
                </View>
              </TouchableOpacity>
              <View
                style={{
                  marginLeft: 16,
                  marginRight: 16,
                  borderBottomColor: '#F0F5FA',
                  borderBottomWidth: 1,
                  marginTop: 16,
                  marginBottom: 16,
                }}
              />
              <TouchableOpacity
                onPress={() =>
                  this.setState({ ReplaceExcerciseSelectedItem: 3 })
                }>
                <View style={{ flexDirection: 'row' }}>
                  <View>
                    <Image
                      style={{
                        width: 72,
                        height: 72,
                        marginLeft: 16,
                        marginTop: 11,
                      }}
                      source={require('../../res/list_image.png')}
                    />
                  </View>

                  <View
                    style={{
                      marginLeft: 16,
                      flexDirection: 'column',
                      marginTop: 11,
                      alignSelf: 'center',
                    }}>
                    <Text
                      style={{
                        color: '#292E3A',
                        fontSize: 16,
                        fontFamily: 'Poppins-Medium',
                        fontWeight: '600',
                        lineHeight: 24,
                      }}>
                      Swiss Ball Torso Twist
                    </Text>

                    <View style={{ flexDirection: 'row' }}>
                      <Text
                        style={{
                          color: '#96AAC6',
                          fontSize: 15,
                          fontFamily: 'Poppins-Medium',
                          fontWeight: '600',
                          lineHeight: 24,
                        }}>
                        Advanced
                      </Text>
                    </View>
                  </View>
                  {this.state.ReplaceExcerciseSelectedItem == 3 ? (
                    <View
                      style={{
                        marginLeft: 16,
                        marginTop: 11,
                        height: 20,
                        flex: 1,
                        alignItems: 'flex-end',
                        marginRight: 16,
                        alignSelf: 'center',
                      }}>
                      <LinearGradient
                        colors={['rgba(0,123,255, 1)', 'rgba(0,161,255, 1)']}
                        start={{ x: 0, y: 1 }}
                        end={{ x: 1, y: 1 }}
                        useAngle
                        angle={189.97}
                        style={{ height: 26, width: 26, borderRadius: 13 }}>
                        <Image
                          style={{ height: 24, width: 24 }}
                          source={require('../../res/tick.png')}
                          resizeMode="center"
                        />
                      </LinearGradient>
                    </View>
                  ) : null}
                </View>
              </TouchableOpacity>
              <View
                style={{
                  marginLeft: 16,
                  marginRight: 16,
                  borderBottomColor: '#F0F5FA',
                  borderBottomWidth: 1,
                  marginTop: 16,
                  marginBottom: 16,
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  renderPyramidSet() {
    return (
      <Modal
        animationType="slide"
        visible={this.state.showPyramidSet}
        onRequestClose={() => this.setState({ showPyramidSet: false })}
        transparent>
        <View style={styles.modalContainer}>
          <View
            style
            style={{
              flexDirection: 'column',
              backgroundColor: '#FFFFFF',
              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,
              marginTop: 33,
            }}>
            <View
              style
              style={{
                marginTop: 26,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  fontFamily: 'Poppins-Medium',
                  color: '#25292E',
                  marginLeft: 16,
                  fontWeight: 'bold',
                  fontSize: 20,
                  lineHeight: 28,
                  fontWeight: '600',
                }}>
                What’s a Circuit?
              </Text>
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  left: 0,
                  height: 48,
                  width: 48,
                  justifyContent: 'center',
                  backgroundColor: '',
                }}
                onPress={() => {
                  this.setState({ showPyramidSet: false });
                }}>
                <Image
                  source={require('../../res/close.png')}
                  style={{ height: 13, width: 13, marginLeft: 16 }}></Image>
              </TouchableOpacity>
            </View>
            <View
              style={{
                borderBottomColor: '#F0F5FA',
                borderBottomWidth: 1,
                marginTop: 31,
              }}
            />
            <View
              style={{
                marginTop: 28,
                marginHorizontal: 24,
                height: 120,
              }}>
              <Text
                style={{
                  fontSize: 16,
                  color: '#6F80A7',
                  fontFamily: 'Poppins-Medium',
                  lineHeight: 28,
                }}>
                A circuit is a sequence of exercises that repeats itself for a set number of rounds.
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
  renderDetailWithScroll() {
    return (
      <Modal
        animationType="slide"
        visible={this.state.showDetail}
        onRequestClose={() => this.setState({ showDetail: false })}
        transparent>
        <View style={styles.modalDetailContainer}>
          <View
            style={{
              height: 100,
              backgroundColor: '#FFFFFF',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexDirection: 'row',
            }}>
            <View
              style={{
                height: 48,
                width: 48,
                backgroundColor: '#F0F5FA',
                marginLeft: 16,
                borderRadius: 24,
              }}>
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  left: 0,
                  height: 48,
                  width: 48,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '',
                }}
                onPress={() => {
                  this.setState({ showDetail: false });
                }}>
                <Image
                  source={require('../../res/close.png')}
                  style={{ height: 13, width: 13 }}></Image>
              </TouchableOpacity>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text
                style={{
                  color: '#00A1FF',
                  fontSize: 36,
                  lineHeight: 38,
                  fontStyle: 'normal',
                  fontWeight: 'bold',
                  fontFamily: 'Poppins',
                }}>
                12:45
              </Text>
              <Text
                style={{
                  color: '#96AAC6',
                  fontSize: 14,
                  lineHeight: 16,
                  fontStyle: 'normal',
                  fontWeight: 'bold',
                  fontFamily: 'Poppins',
                  letterSpacing: 1.6,
                  marginTop: 5,
                }}>
                PYRAMID SET 5/5{' '}
              </Text>
            </View>
            <View
              style={{
                height: 48,
                width: 48,
                backgroundColor: '#F0F5FA',
                marginRight: 18,
                borderRadius: 24,
              }}>
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  left: 0,
                  height: 48,
                  width: 48,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '',
                }}
                onPress={() => {
                  this.setState({ showDetail: false });
                }}>
                <Image
                  source={require('../../res/threeline.png')}
                  style={{ height: 13, width: 18 }}></Image>
              </TouchableOpacity>
            </View>
          </View>
          <ScrollView>
            <WorkoutIntroCell text="Great job on that last excercise, now lets step it up more for the following excercises." />
            <WorkoutCell exercise="Rear Dumbell Flies" time="00:22" />
            <WorkoutCell
              exercise="Rear Dumbell Flies"
              time="00:22"
              isVideo={true}
            />
            <WorkoutRestCell></WorkoutRestCell>
            <WorkoutCell
              exercise="Rear Dumbell Flies"
              time="00:22"
              isVideo={true}
            />
            <WorkoutCell exercise="Rear Dumbell Flies" time="00:22" />
            <WorkoutRestCell></WorkoutRestCell>
            <WorkoutCell exercise="Rear Dumbell Flies" time="00:22" />
            <WorkoutCell
              exercise="Rear Dumbell Flies"
              time="00:22"
              isVideo={true}
            />
            <WorkoutRestCell></WorkoutRestCell>
            {/* <WorkoutCompleteCell onPress={this.renderWorkoutComplete} /> */}
            <WorkoutCompleteCell
              onPress={() => {
                this.setState({ showComplete: true });
              }}
            />
          </ScrollView>
        </View>
      </Modal>
    );
  }

  // renderWorkoutComplete() {
  //   console.log('Hello')
  //   return(
  //     <Modal animationType="slide" visible={this.state.showComplete} onRequestClose={() => this.setState({showComplete: false})} transparent>
  //       <View style={styles.modalDetailContainer}>
  //       <View style={{position: "absolute", width: "100%"}}>
  //       <View style={{width: "100%", height: 330}}>
  //             {/* <View style={styles.OvalShapeView}> */}
  //               <LinearGradient colors={["#007BFF", "#00A1FF"]} style={{flex:1, width:"100%", height:"100%"}}>
  //                 <Text style={{marginTop: 72, alignSelf:"center", fontFamily: "Poppins", fontStyle: "normal", fontWeight: "600", fontSize: 24, lineHeight: 32, textAlign: "center", color: "#FFFFFF"}}>Workout Complete!</Text>
  //                 <Text style={{marginTop: 13, alignSelf:"center", fontFamily: "Poppins", fontStyle: "normal", fontWeight: "bold", fontSize: 12, lineHeight: 16, textTransform:"uppercase", textAlign: "center", color: "#FFFFFF" }}>3/4 this week</Text>
  //                 <View style={{position: "absolute", bottom: 0, height: 121, width: "100%"}}>
  //                   <LinearGradient colors={["#007BFF", "#00A1FF"]} style={{flex:1, width: "100%", height: "100%", flexDirection: "row"}}>
  //                     <View style={{flex: 1, justifyContent: "center"}}>
  //                       <Text style={{fontFamily: "Poppins", fontStyle: "normal", fontWeight: "600", fontSize: 20, lineHeight: 28, textAlign: "center", color: "#FFFFFF"}}>670 kcal</Text>
  //                     </View>
  //                     <View style={{flex: 1, justifyContent: "center"}}>
  //                       <Text style={{fontFamily: "Poppins", fontStyle: "normal", fontWeight: "600", fontSize: 20, lineHeight: 28, textAlign: "center", color: "#FFFFFF"}}>44 Mins</Text>
  //                     </View>
  //                   </LinearGradient>
  //                 </View>
  //               </LinearGradient>
  //             </View>
  //             {/* <View style={{width: "100%", backgroundColor: "#FFFFFF"}}>
  //               <Text style={{marginTop: 45, marginLeft: 16, marginRight: 16, fontFamily: "Poppins", fontStyle: "normal", fontWeight: "600", fontSize: 24, lineHeight: 32, color: "#292E3A"}}>Share your Workout</Text>
  //             </View> */}
  //                   </View>
  //                   <ScrollView style={{marginTop:350}}>

  //             {/* <View style={{width: "100%", backgroundColor: "#FFFFFF"}}>
  //               <Text style={{marginTop: 45, marginLeft: 16, marginRight: 16, fontFamily: "Poppins", fontStyle: "normal", fontWeight: "600", fontSize: 24, lineHeight: 32, color: "#292E3A"}}>Share your Workout</Text> */}
  //             {/* <FlatList style={{marginTop: 45,  flex:1}} numColumns={2}  columnWrapperStyle={{height: 293}}
  //               data={[{title: '', key: 'item1'}, {title: '', key: 'item2'}, {title: '', key: 'item3'}]}
  //               renderItem={({item, index, separators}) => (
  //                 <TouchableHighlight
  //                   key={item.key}

  //                   onShowUnderlay={separators.highlight}
  //                   onHideUnderlay={separators.unhighlight} style={{ flex: 1}}>
  //                     <View alignItems="center">
  //                       <Image source={require('./res/shareWorkout.png')}/>
  //                     </View>
  //                 </TouchableHighlight>
  //               )}
  //             /> */}

  //             <View style={{flexDirection:"row",justifyContent:"space-around" ,marginLeft:16,marginRight:16,marginTop:6,marginBottom:6}}>
  //             <TouchableHighlight

  //                   //onShowUnderlay={separators.highlight}
  //                   //onHideUnderlay={separators.unhighlight}
  //                   style={{ flex: 1}}>
  //                     <View alignItems="center">
  //                       <Image source={require('./res/shareWorkout.png')}/>
  //                     </View>
  //                 </TouchableHighlight>
  //                 <TouchableHighlight

  //                   //onShowUnderlay={separators.highlight}
  //                   //onHideUnderlay={separators.unhighlight}
  //                   style={{ flex: 1}}>
  //                     <View alignItems="center">
  //                       <Image source={require('./res/shareWorkout.png')}/>
  //                     </View>
  //                 </TouchableHighlight>
  //             </View>
  //             <View style={{flexDirection:"row",justifyContent:"space-around" ,marginLeft:16,marginRight:16,marginTop:6,marginBottom:6}}>
  //             <TouchableHighlight

  //                   //onShowUnderlay={separators.highlight}
  //                   //onHideUnderlay={separators.unhighlight}
  //                   style={{ flex: 1}}>
  //                     <View alignItems="center">
  //                       <Image source={require('./res/shareWorkout.png')}/>
  //                     </View>
  //                 </TouchableHighlight>
  //                 <TouchableHighlight

  //                   //onShowUnderlay={separators.highlight}
  //                   //onHideUnderlay={separators.unhighlight}
  //                   style={{ flex: 1}}>
  //                     <View alignItems="center">
  //                       <Image source={require('./res/shareWorkout.png')}/>
  //                     </View>
  //                 </TouchableHighlight>
  //             </View>
  //             <View style={{flexDirection:"row",justifyContent:"space-around" ,marginLeft:16,marginRight:16,marginTop:6,marginBottom:6}}>
  //             <TouchableHighlight

  //                   //onShowUnderlay={separators.highlight}
  //                   //onHideUnderlay={separators.unhighlight}
  //                   style={{ flex: 1}}>
  //                     <View alignItems="center">
  //                       <Image source={require('./res/shareWorkout.png')}/>
  //                     </View>
  //                 </TouchableHighlight>
  //                 <TouchableHighlight

  //                   //onShowUnderlay={separators.highlight}
  //                   //onHideUnderlay={separators.unhighlight}
  //                   style={{ flex: 1}}>
  //                     <View alignItems="center">
  //                       <Image source={require('./res/shareWorkout.png')}/>
  //                     </View>
  //                 </TouchableHighlight>
  //             </View>
  //           </ScrollView>

  //       </View>
  //     </Modal>
  //   )
  // }

  renderDetail() {
    return (
      <Modal
        animationType="slide"
        visible={this.state.showDetail}
        onRequestClose={() => this.setState({ showDetail: false })}
        transparent>
        <View style={styles.modalDetailContainer}>
          <Image
            source={require('../../res/workoutimage.png')}
            style={{
              width: '130%',
              position: 'absolute',
              bottom: 0,
              left: 0,
              height: 130,
            }}
            resizeMode="cover"></Image>

          <LinearGradient
            colors={['rgba(196,196,196, .70)', 'rgba(0,0,0, .50)']}
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 1 }}
            useAngle
            angle={270.07}
            style={{ flex: 1 }}>
            <View
              style={{
                flex: 1,
                backgroundColor: '#FFFFFF',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexDirection: 'row',
              }}>
              <View
                style={{
                  height: 48,
                  width: 48,
                  backgroundColor: '#F0F5FA',
                  marginLeft: 16,
                  borderRadius: 24,
                }}>
                <TouchableOpacity
                  style={{
                    position: 'absolute',
                    left: 0,
                    height: 48,
                    width: 48,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '',
                  }}
                  onPress={() => {
                    this.setState({ showDetail: false });
                  }}>
                  <Image
                    source={require('../../res/close.png')}
                    style={{ height: 13, width: 13 }}></Image>
                </TouchableOpacity>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text
                  style={{
                    color: '#00A1FF',
                    fontSize: 36,
                    lineHeight: 38,
                    fontStyle: 'normal',
                    fontWeight: 'bold',
                    fontFamily: 'Poppins',
                  }}>
                  12:45
                </Text>
                <Text
                  style={{
                    color: '#96AAC6',
                    fontSize: 14,
                    lineHeight: 16,
                    fontStyle: 'normal',
                    fontWeight: 'bold',
                    fontFamily: 'Poppins',
                    letterSpacing: 1.6,
                    marginTop: 5,
                  }}>
                  PYRAMID SET 5/5{' '}
                </Text>
              </View>
              <View
                style={{
                  height: 48,
                  width: 48,
                  backgroundColor: '#F0F5FA',
                  marginRight: 18,
                  borderRadius: 24,
                }}>
                <TouchableOpacity
                  style={{
                    position: 'absolute',
                    left: 0,
                    height: 48,
                    width: 48,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '',
                  }}
                  onPress={() => {
                    this.setState({ showDetail: false });
                  }}>
                  <Image
                    source={require('../../res/threeline.png')}
                    style={{ height: 13, width: 18 }}></Image>
                </TouchableOpacity>
              </View>
            </View>
            <View style={{ flex: 5 }}>
              <LinearGradient
                colors={['rgba(0,123,255, 1)', 'rgba(0,161,255, 1)']}
                start={{ x: 0, y: 1 }}
                end={{ x: 1, y: 1 }}
                useAngle
                angle={192.45}
                style={{
                  flex: 1,
                  borderBottomRightRadius: 40,
                  borderBottomLeftRadius: 40,
                }}>
                <WorkoutRestCell />
                {/* <WorkoutCell exercise="Rear Dumbell Flies" time="00:22"/> */}
              </LinearGradient>
            </View>
            <View style={{ flex: 1, justifyContent: 'center' }}>
              {/* <Text  style={{color:"#ffffff",fontSize:18,lineHeight:25,fontStyle:"normal",fontWeight:"bold",fontFamily:"Poppins"}}>Reverse Grip Pull Ups</Text>
                 <Text  style={{color:"#ffffff", marginTop:5,fontSize:18,lineHeight:25,fontStyle:"normal",fontWeight:"bold",fontFamily:"Poppins" }}>15 Reps</Text> */}
              <WorkoutCollapsedCell
                exercise="Reverse Grip Pull Ups"
                reps={15}
              />
            </View>
          </LinearGradient>
        </View>
      </Modal>
    );
  }


  returnCellView = (item, isCircuit) => {
    let thumbnailUrl = "";
    if (item.item.flag === "note") {
      thumbnailUrl = thumbnail_note_card;
    } else if (item.item.flag === 'rest' && isCircuit) {
      thumbnailUrl = thumbnail_rest_inside_circuit;
    } else if (item.item.flag === 'rest') {
      thumbnailUrl = thumbnail_rest_outside_circuit;
    } else if (item.item.flag === 'video' && item.item.thumbnailFileName && item.item.thumbnailFileName != "") {
      thumbnailUrl = { uri: mediaHost + item.item.thumbnailFileName }
    } else if (item.item.flag === "exercise") {
      let cardData = this.exerciseCardArray.filter(data => data.id === item.item.cardExerciseID);
      if (cardData.length) {
        thumbnailUrl = cardData[0].BaseThumbnail_fileName ? { uri: mediaHost + cardData[0].BaseThumbnail_fileName } : thumbnail_old;
      }
    } else {
      thumbnailUrl = thumbnail_old;
    }

    return (
      <View>
        <TouchableOpacity
          onPress={() => this.setState({ showReplaceExcercise: true })}>
          <View style={{ flexDirection: 'row' }}>
            <View>
              <ImageBackground
                style={{
                  width: 72,
                  height: 72,
                  marginLeft: 16,
                  marginTop: 11,
                }}
                source={thumbnailUrl}
                imageStyle={{ borderRadius: 22 }}
                PlaceholderContent={<ActivityIndicator />}
              // resizeMode={'stretch'}
              >
                {isCircuit ? <View
                  style={{
                    backgroundColor: 'white',
                    width: 20,
                    height: 20,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 10
                  }}>
                  <Text style={{
                    fontSize: 12,
                    fontFamily: 'Poppins-Medium',
                  }}>{item.index + 1}</Text>
                </View> : null}
              </ImageBackground>
            </View>

            <View
              style={{
                marginLeft: 16,
                flexDirection: 'column',
                marginTop: 11,
                alignSelf: 'center',

                flexShrink: 1,
              }}>
              <Text
                style={{
                  color: '#292E3A',
                  fontSize: 16,
                  fontFamily: 'Poppins-Bold',
                  lineHeight: 24,
                  paddingRight: '2%'
                }}>
                {item.item.title}
              </Text>

              {item.item.RepsCount ? <View style={{ flexDirection: 'row' }}>
                <Text
                  style={{
                    color: '#96AAC6',
                    fontSize: 15,
                    fontFamily: 'Poppins-Medium',
                    lineHeight: 24,

                  }}>
                  {/* 4 Rounds */}
                </Text>
                <Text
                  style={{
                    color: '#1AA0FF',
                    fontSize: 15,
                    fontFamily: 'Poppins-Medium',
                    marginLeft: 12,
                    lineHeight: 24,
                  }}>
                  {item.item.RepsCount + " " + item.item.Reps}
                </Text>
              </View> : null}
            </View>

            <View
              style={{
                marginLeft: 16,
                marginTop: 11,
                height: 20,
                flex: 1,
                alignItems: 'flex-end',
                marginRight: 16,
                alignSelf: 'center',
              }}>
              <Image
                style={{ height: 20, width: 20 }}
                source={require('../../res/setticon.png')}
              />
            </View>
          </View>
        </TouchableOpacity>
        <View
          style={{
            borderBottomColor: '#F0F5FA',
            borderBottomWidth: 1,
            marginTop: 29,
          }}
        />
      </View >
    )
  }

  renderSubItem = (item, index) => {

    return (
      <View>
        {this.returnCellView(item, true)}
      </View>
    )
  }


  renderItemTasks = (item, index) => {

    // console.log("renderItemTasks-", item);

    return (
      <View style={{ marginTop: 25 }}>
        {item.item.exeerciseCards && item.item.exeerciseCards.length > 0 ?

          <View style={{ flexDirection: 'row' }}>
            <Image
              style={{
                marginLeft: 16, marginTop: 15, height: '96%'
              }}
              source={require('../../res/arrowline.png')}
              resizeMode={'stretch'}
            />
            <View style={{ flex: 0.98 }}>
              <View style={{ flexDirection: 'row' }}>
                <Text
                  style={{
                    fontFamily: 'Poppins-Bold',
                    lineHeight: 28,
                    fontSize: 22,
                    fontStyle: 'normal',
                    marginLeft: 22,
                    marginTop: 15,
                  }}>
                  Circuit
                </Text>
                <TouchableOpacity
                  onPress={() => this.setState({ showPyramidSet: true })}>
                  <Text
                    style={{
                      fontFamily: 'Poppins-Bold',
                      color: '#1AA0FF',
                      textAlign: 'center',
                      paddingTop: 3,
                      width: 28,
                      height: 28,
                      borderRadius: 40,
                      marginLeft: 10,
                      fontSize: 16,
                      // fontWeight: 'bold',
                      marginTop: 14,
                      backgroundColor: '#F0F5FA',
                    }}>
                    ?
                      </Text>
                </TouchableOpacity>
              </View>
              {item.item.Cycles && item.item.Cycles > 0 ? <Text
                style={{
                  fontFamily: 'Poppins',
                  fontSize: 17,
                  fontStyle: 'normal',
                  marginLeft: 22,
                  color: '#6F80A7',
                  fontWeight: 'bold'
                }}>{item.item.Cycles + " "}Rounds</Text> : null}
              <FlatList
                data={item.item.exeerciseCards}
                renderItem={this.renderSubItem}
                keyExtractor={(item, index) => index.toString()}
              />
            </View>
          </View>
          :
          <View>
            {this.returnCellView(item, false)}
          </View>
        }
      </View>
    )

  }


  render() {
    const windowHeight = SCREEN_HEIGHT * DEFAULT_WINDOW_MULTIPLIER;
    var { scrollY, loading } = this.state;

    return (
      <View style={styles.mainContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.back} onPress={() => Actions.pop()}>
            <LinearGradient
              colors={['#007BFF', '#00A1FF']}
              useAngle={true}
              angle={72}
              style={styles.backButtonLinear}
            >
              <Image
                source={require('../../res/backIcon.png')}
                style={styles.backButton}
                resizeMode={'contain'}
              />
            </LinearGradient>
          </TouchableOpacity>
          <LinearGradient
            colors={['#007BFF', '#00A1FF']}
            useAngle={true}
            angle={72}
            style={styles.header}
          />
        </View>

        {!loading ?
          <>
            <ScrollView
              ref={(component) => {
                this._scrollView = component;
              }}
              onScroll={Animated.event([
                { nativeEvent: { contentOffset: { y: this.state.scrollY } } },
              ])}
              scrollEventThrottle={16}
              style={{ position: 'absolute', top: 0, bottom: 0, width: '100%' }}
              showsVerticalScrollIndicator={false}>

              <View style={{ flexDirection: 'column', flex: 1, paddingBottom: 116 }}>

                <Animated.View
                  style={{
                    opacity: scrollY.interpolate({
                      inputRange: [
                        -windowHeight,
                        0,
                        windowHeight * DEFAULT_WINDOW_MULTIPLIER,
                      ],
                      outputRange: [1, 1, 0],
                    }),
                  }}>

                  <View style={{ marginTop: 80, }}>

                    <Text
                      style={{
                        color: '#FDFDFD',
                        fontSize: 35,
                        fontFamily: 'Poppins-Bold',
                        marginLeft: 16,
                        marginTop: 8,
                      }}>
                      Day 1
                </Text>

                    <Text
                      style={{
                        color: '#FDFDFD',
                        fontSize: 16,
                        fontStyle: 'normal',
                        fontFamily: 'Poppins',
                        fontStyle: 'normal',
                        marginLeft: 16,
                        marginTop: -1
                      }}>
                      {this.state.dictTaskDescription &&
                        this.state.dictTaskDescription.taskTitle ?
                        this.state.dictTaskDescription.taskTitle : ''}
                    </Text>

                  </View>
                </Animated.View>

                <View
                  style
                  style={{
                    flex: 1,
                    flexDirection: 'column',
                    backgroundColor: '#FFFFFF',
                    borderTopLeftRadius: 30,
                    borderTopRightRadius: 30,
                    marginTop: 33,
                  }}>

                  <View>
                    {/* First all tasks  */}
                    <View>
                      <FlatList
                        data={this.state.dictTaskDescription.versionDayTaskCard}
                        renderItem={this.renderItemTasks}
                        keyExtractor={(item, index) => index.toString()}
                      />
                    </View>
                  </View>

                  <View
                    style={{
                      borderBottomColor: '#F0F5FA',
                      borderBottomWidth: 1,
                      marginTop: 29,
                    }}
                  />
                </View>
              </View>

            </ScrollView>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 1)']}
              start={{ x: 0, y: 1 }}
              end={{ x: 1, y: 1 }}
              useAngle
              angle={180}
              style={{
                flex: 1,
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 120,
              }}>
              <TouchableOpacity
                onPress={() => {

                  this.setState({ showDetail: true })
                }
                }
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  zIndex: 999,
                  height: 64,
                }}>
                <TouchableOpacity style={{
                  height: 64,
                  alignItems: 'center',
                  bottom: 26,
                  width: '100%',
                  zIndex: 999,
                  paddingLeft: 16,
                  paddingRight: 16,
                }} onPress={() => {

                  Actions.Workout({
                    arrayVersionTask: this.state.arrayVersionTask,
                    stories: this.state.storiesArray,
                    challenge: this.props.challenge,
                    user: this.props.user
                  })
                }}>
                  <LinearGradient
                    colors={['#007BFF', '#00A1FF']}
                    style={{
                      flex: 1,
                      width: '100%',
                      borderRadius: 8,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Text
                      style={{
                        color: '#FFFFFF',
                        fontFamily: 'Poppins-Medium',
                        fontSize: 18,
                        lineHeight: 24,
                      }}>
                      Start Workout
                </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </TouchableOpacity>
            </LinearGradient>
          </>
          :
          <View style={{ marginTop: 30 }}>
            <ActivityIndicator size="large" color="#1AA0FF" />
          </View>
        }

        {/* new screen */}

        {this.renderReplaceExcercise()}
        {this.renderPyramidSet()}
        {/* {this.renderDetail()} */}
        {this.renderDetailWithScroll()}
        {
          //this.renderWorkoutComplete()
        }
      </View>
    )
  }
}


const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  header: {
    width: '100%',
    height: 400,
  },
  headerOverlay: {
    width: '100%',
    height: 400,
    position: 'absolute',
    backgroundColor: '#22B3FF',
    opacity: 0.7,
  },
  back: {
    backgroundColor: 'transparent',
    width: 45,
    height: 45,
    position: 'absolute',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginLeft: 16,
    zIndex: 100,
    elevation: 4
  },
  backButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    tintColor: '#fff',
  },
  backButtonLinear: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    tintColor: '#fff',
  },
  save: {
    borderColor: '#FFFFFF',
    borderWidth: 1,
    right: 0,
    width: 45,
    height: 45,
    position: 'absolute',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginRight: 16,
  },
  saveButton: {
    width: 30,
    height: 30,
    tintColor: '#FFFFFF',
  },
  headerBottom: {
    position: 'absolute',
    bottom: 0,
    marginBottom: 150,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    flexDirection: 'column-reverse',
  },
  modalDetailContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    flexDirection: 'column',
  },
  OvalShapeView: {
    //To make Oval Shape
    marginTop: 20,
    width: '100%',
    height: 330,
    // backgroundColor: '#ED2525',
    borderRadius: 37,
    // transform: [{ scaleX: 2 }],
  },
});
