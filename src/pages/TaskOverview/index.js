import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Image } from 'react-native';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import LinearGradient from 'react-native-linear-gradient';

import { mediaHost } from 'dash/src/config';

import { BackArrow } from '../../components/Icons';

import Circuit from './Circuit';
import TaskCell from './TaskCell';

class Component extends React.Component {
    render() {
        const { challenge, user, day, currentDay, plan } = this.props;
        console.log(challenge, user, day, currentDay, plan);

        const imageURL = `${mediaHost}${plan.planImage}`;

        console.log('DAY INFO', day);

        return (
            <View style={styles.container}>
                <LinearGradient
                    style={styles.overview}
                    colors={['#FFFFFF', '#E7EEF5']}
                    start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }}
                >
                    <View style={styles.overviewText}>
                        <Text style={styles.dayText}>
                            Day {currentDay}
                        </Text>
                        <Text style={styles.dayBlueText}>
                            Friday Jan 24
                        </Text>
                    </View>
                    <Image
                        source={{ uri: imageURL }}
                        style={styles.overviewImage}
                        resizeMode='contain'
                    />
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => Actions.pop()}
                    >
                        <BackArrow />
                    </TouchableOpacity>
                </LinearGradient>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <View style={styles.blueBox}>
                        </View>

                        <View>
                            <Text>{day.taskTitle}</Text>
                            <Text>{day.taskDescription}</Text>
                        </View>
                    </View>
                    {day && day.versionDayTaskCard && day.versionDayTaskCard.length > 0 && (
                        day.versionDayTaskCard.map((task) => {
                            if (task.flag === 'circuit') {
                                return <Circuit task={task} />
                            } else {
                                return <TaskCell task={task} />
                            }
                        })
                    )}
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    backButton: {
        height: 40,
        width: 40,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        position: 'absolute',
        top: 19,
        left: 19,
        justifyContent: 'center',
        alignItems: 'center'
    },
    overview: {
        height: 233,
    },
    overviewText: {
        position: 'absolute',
        top: 98,
        left: 20
    },
    dayText: {
        fontFamily: 'Poppins-Bold',
        fontSize: 32,
        lineHeight: 39,
        color: '#3F434F',
        marginBottom: 8
    },
    dayBlueText: {
        fontFamily: 'Poppins-Bold',
        fontSize: 12,
        lineHeight: 16,
        textAlign: 'center',
        letterSpacing: 1.6,
        textTransform: 'uppercase',
        color: '#1AA0FF'
    },
    overviewImage: {
        width: 191,
        height: 208,
        position: 'absolute',
        top: 44,
        right: 10
    },


    content: {
        flex: 1,
        backgroundColor: 'orange'
    }
});

export default connect(({ challenges, user }) => ({
    challenges,
    user
}))(Component);
