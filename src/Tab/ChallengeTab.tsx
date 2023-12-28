import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {
  Image,
  Platform,
  Pressable,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {
  ButtonComponent,
  HomeContainer,
  LoadingIndicatior,
  NotoSansKR,
  RowContainer,
  RowScrollContainer,
  TossFace,
  calculateDaysUntil,
  calculateRemainTime,
  useApi,
} from '../Component';
import styled, {useTheme} from 'styled-components/native';
import OcticonIcons from 'react-native-vector-icons/Octicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {ScrollView} from 'react-native';
import {View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../store/RootReducer';
import {useQuery} from 'react-query';
import {ChallengeStatusType} from '../../store/data';
import {useModal} from '../Modal/ModalProvider';
import {ChallengeListModal} from '../Modal/ChallengeListModal';
import {goalType, toggleGoal} from '../../store/slice/GoalSlice';
import {
  PersonGoalAddModal,
  PersonGoalEditModal,
} from '../Modal/PersonGoalModal';
import {challengeDataType} from '../../store/async/asyncStore';
import {MyDailyDrayModal} from '../Modal/MyDailyDiaryModal';
import {setSelectedChallengeMstNo} from '../../store/slice/ChallengeSlice';
import {Toast} from 'react-native-toast-message/lib/src/Toast';
import {AdditionalGoalModal} from '../Modal/AdditionalGoalModal';
import {ImageZoomModal} from '../Modal/Modals';

const Profile = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: ${props => props.theme.secondary2};
  justify-content: center;
  align-items: center;
`;

interface ChallengeInfoType {
  mainText: string;
  subText: string;
  headerEmoji: string;
  isSelected?: boolean;
}

const ChallengeInfo = ({
  mainText,
  subText,
  headerEmoji,
  isSelected,
}: ChallengeInfoType) => {
  const TextContainer = styled.View`
    width: 122px;
    height: 154px;

    border-radius: 10px;
    padding: 12px 8px;
    background-color: white;
    border-width: 2px;
    border-color: ${props =>
      isSelected ? props.theme.primary1 : props.theme.white};
    box-sizing: border-box;
    margin: 8px 0;
    gap: 40px;
    ${Platform.OS === 'ios'
      ? `
      shadow-color: #000;
      shadow-offset: 2px 2px;
      shadow-opacity: 0.3;
      shadow-radius: 2px;`
      : 'elevation: 3;'}
  `;

  return (
    <TextContainer>
      <Profile>
        <TossFace size={22}>{headerEmoji}</TossFace>
      </Profile>
      <View style={{gap: 8}}>
        <NotoSansKR size={14}>{mainText}</NotoSansKR>
        <NotoSansKR size={10} color="gray5">
          {subText}
        </NotoSansKR>
      </View>
    </TextContainer>
  );
};

const ChallengeSubInfo = ({
  mainText,
  subText,
  headerEmoji,
}: ChallengeInfoType) => {
  const TextSubContainer = styled.View`
    width: 108px;
    height: 124px;

    border-radius: 10px;
    padding: 12px 8px;
    background-color: white;
    gap: 20px;
    margin: 8px 0;
  `;

  return (
    <TextSubContainer>
      <Profile>
        <TossFace size={20}>{headerEmoji}</TossFace>
      </Profile>
      <View style={{gap: 4}}>
        <NotoSansKR size={14}>{mainText}</NotoSansKR>
        <NotoSansKR size={10} color="gray5">
          {subText}
        </NotoSansKR>
      </View>
    </TextSubContainer>
  );
};

interface GoalBoxProps {
  goal: goalType;
  challenge_no: number;
}

const TodoTitle = styled(NotoSansKR)<{isComplete?: Boolean}>`
  text-decoration: line-through;
  color: ${props => props.theme.gray4};
  background-color: ${props => props.theme.gray7};
`;

const GoalContainer = styled.TouchableOpacity<{bc: string; border: string}>`
  background-color: ${props => props.bc};
  border-radius: 10px;
  border-color: ${props => props.border};
  border-width: 2px;
  padding: 12px;
`;

const GoalBox: React.FC<GoalBoxProps> = ({goal, challenge_no}) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const {showModal} = useModal();

  const backgroundColor = goal.isComplete ? theme.gray7 : theme.white;
  const textColor = 'black';
  const iconColor = goal.isComplete ? theme.gray4 : theme.primary1;
  const borderColor = goal.isComplete ? theme.gray7 : theme.primary1;

  return (
    <GoalContainer
      onLongPress={() => {
        showModal(
          <PersonGoalEditModal
            id={goal.id}
            challenge_no={challenge_no}
            title={goal.title}
          />,
        );
      }}
      onPress={() =>
        dispatch(toggleGoal({goalId: goal.id, challenge_no: challenge_no}))
      }
      bc={backgroundColor}
      border={borderColor}>
      <RowContainer seperate>
        <RowContainer gap={8}>
          <OcticonIcons name="check-circle-fill" size={24} color={iconColor} />
          {goal.isComplete ? (
            <TodoTitle size={16}>{goal.title}</TodoTitle>
          ) : (
            <NotoSansKR size={16} color={textColor} weight="Medium">
              {goal.title}
            </NotoSansKR>
          )}
        </RowContainer>
        <TouchableOpacity
          onPress={() => {
            showModal(
              <PersonGoalEditModal
                id={goal.id}
                challenge_no={challenge_no}
                title={goal.title}
              />,
            );
          }}>
          <OcticonIcons name="kebab-horizontal" size={24} color={theme.gray5} />
        </TouchableOpacity>
      </RowContainer>
    </GoalContainer>
  );
};

const PlusContainers = ({title}: {title: String}) => {
  const theme = useTheme();

  return (
    <RowContainer gap={4} style={{justifyContent: 'flex-end'}}>
      <OcticonIcons name="plus-circle" size={16} color={theme.primary1} />
      <NotoSansKR size={13} color="primary1">
        {title}
      </NotoSansKR>
    </RowContainer>
  );
};

const ListItem = ({data}: {data: AdditionalInfo}) => {
  const SomeTargetContainer = styled(RowContainer)`
    border-bottom-color: white;
    border-bottom-width: 1px;
    padding: 6px 0;
  `;
  const {showModal} = useModal();

  return (
    <SomeTargetContainer seperate>
      <RowContainer gap={32}>
        <NotoSansKR size={14} weight="Regular" color="white">
          {data.CHALLENGE_USER_NN}
        </NotoSansKR>
        <NotoSansKR size={14} weight="Regular" color="white">
          {data.ADDITIONAL_NM}
        </NotoSansKR>
      </RowContainer>

      <RowContainer gap={8}>
        <NotoSansKR size={14} weight="Regular" color="yellow">
          {data.IS_DONE ? '목표 완료!' : calculateRemainTime(data.END_DT)}
        </NotoSansKR>

        {data.IS_MINE && !data.IS_DONE && (
          <TouchableOpacity
            onPress={() => {
              showModal(
                <AdditionalGoalModal
                  additional_goal_no={data.ADDITIONAL_NO}
                  additional_goal_nm={data.ADDITIONAL_NM}
                />,
              );
            }}>
            <MaterialIcons name="photo-camera" size={28} color={'white'} />
          </TouchableOpacity>
        )}

        {data.IS_DONE && (
          <TouchableOpacity
            onPress={() => {
              showModal(<ImageZoomModal file_name={data.IMAGE_FILE_NM} />);
            }}>
            <MaterialIcons name="photo" size={28} color={'white'} />
          </TouchableOpacity>
        )}
      </RowContainer>
    </SomeTargetContainer>
  );
};

const TopContainer = styled.View`
  gap: 8px;
  background-color: ${props => props.theme.primary2};
  padding: 16px;
`;

const CenterContainer = styled.View`
  padding: 0 16px;
  gap: 16px;
`;

const FootContainer = styled.View<{disalbed?: boolean}>`
  gap: 16px;
  /* background-color: #2c2c2c; */
  background-color: ${props =>
    props.disalbed ? props.theme.gray5 : props.theme.gray1};
  flex: 1;
  padding: 16px;
  text-align: left;
`;

interface ChallengeInfo {
  CHALLENGE_MST_NO: number;
  CHALLENGE_MST_NM: string;
  START_DT: string;
  END_DT: string;
  HEADER_EMOJI: string;
  CHALLENGE_STATUS: ChallengeStatusType;
  PROGRESS: number;
}

interface AdditionalInfo {
  ADDITIONAL_NO: number;
  ADDITIONAL_NM: string;
  IS_DONE: boolean;
  IMAGE_FILE_NM: string;
  START_DT: string;
  END_DT: string;
  CHALLENGE_USER_NO: number;
  CHALLENGE_USER_NN: string;
  IS_MINE: boolean;
}

const getPersonalGoalsByChallengeNo = ({
  challenges,
  challengeNo,
}: {
  challenges: challengeDataType[];
  challengeNo: number;
}) => {
  const challenge = challenges.find(ch => ch.challenge_no === challengeNo);
  return challenge ? challenge.personalGoals : [];
};

const ChallengeTab = () => {
  const CallApi = useApi();
  const {accessToken} = useSelector((state: RootState) => state.user);
  const {selectedChallengeMstNo} = useSelector(
    (state: RootState) => state.challenge,
  );
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const {showModal} = useModal();

  const challenges = useSelector((state: RootState) => state.goal);

  const getChallenge = async () => {
    try {
      const response = await CallApi({
        endpoint: 'challenge/list',
        method: 'GET',
        accessToken: accessToken!,
      });
      return response;
    } catch (err) {
      throw err;
    }
  };
  const {
    data: listData,
    isLoading: listLoading,
    refetch,
    isFetching,
  } = useQuery('getChallenge', getChallenge);

  useEffect(() => {
    if (listData?.progress_challenges?.length > 0) {
      const firstChallengeMstNo =
        listData.progress_challenges[0].CHALLENGE_MST_NO;
      dispatch(setSelectedChallengeMstNo(firstChallengeMstNo));
    }
  }, [dispatch, listData?.progress_challenges]);

  const getChallengeDetail = async () => {
    try {
      const response = await CallApi({
        endpoint: `challenge/detail/${selectedChallengeMstNo}`,
        method: 'GET',
        accessToken: accessToken!,
      });
      return response;
    } catch (err) {
      throw err;
    }
  };

  const {
    data: detailData,
    isLoading: detailLoading,
    refetch: refetchDetail,
    isFetching: isFetchingDetail,
  } = useQuery(
    ['getChallengeDetail', selectedChallengeMstNo],
    getChallengeDetail,
    {
      enabled: !!selectedChallengeMstNo,
    },
  );

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    Promise.all([refetch(), refetchDetail()]).then(() => {
      setRefreshing(false);
    });
  }, [refetch, refetchDetail]);

  if (listLoading || detailLoading) {
    return <LoadingIndicatior />;
  }

  if (listData.progress_challenges?.length === 0) {
    return (
      <HomeContainer>
        <TopContainer style={{flex: 1}}>
          <NotoSansKR size={16}>진행중 챌린지</NotoSansKR>
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              flex: 1,
              gap: 24,
            }}>
            <Image
              style={{height: 136}}
              source={require('../../assets/image/character/nuts05.png')}
              resizeMode="contain"
            />
            <NotoSansKR size={16} color="gray5">
              진행중인 챌린지가 없어요!
            </NotoSansKR>
          </View>

          <NotoSansKR size={16}>초대된 챌린지</NotoSansKR>
          {listData.invited_challenges?.length === 0 ? (
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                padding: 16,
              }}>
              <NotoSansKR size={16} color="gray5">
                초대된 챌린지가 없어요!
              </NotoSansKR>
            </View>
          ) : (
            listData.invited_challenges?.map((challenge: ChallengeInfo) => (
              <TouchableOpacity
                key={challenge.CHALLENGE_MST_NO}
                onPress={() =>
                  showModal(
                    <ChallengeListModal
                      count_challenge={listData.progress_challenges?.length}
                      challenge_mst_no={challenge.CHALLENGE_MST_NO}
                    />,
                  )
                }>
                <ChallengeSubInfo
                  headerEmoji={challenge.HEADER_EMOJI}
                  mainText={challenge.CHALLENGE_MST_NM}
                  subText={calculateDaysUntil(challenge.START_DT).toString()}
                />
              </TouchableOpacity>
            ))
          )}

          <TouchableOpacity
            onPress={() =>
              navigation.navigate('CreateChallengeScreen' as never)
            }>
            <PlusContainers title="챌린지 시작하기" />
          </TouchableOpacity>
        </TopContainer>
      </HomeContainer>
    );
  }

  const personGoal = getPersonalGoalsByChallengeNo({
    challenges: challenges ? challenges : [],
    challengeNo: selectedChallengeMstNo!,
  });

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing || isFetching || isFetchingDetail}
          onRefresh={onRefresh}
        />
      }>
      <HomeContainer style={{gap: 32}}>
        <TopContainer>
          <NotoSansKR size={16}>진행중 챌린지</NotoSansKR>
          <RowScrollContainer gap={8}>
            {listData.progress_challenges?.map((challenge: ChallengeInfo) => (
              <Pressable
                key={challenge.CHALLENGE_MST_NO}
                onPress={() => {
                  dispatch(
                    setSelectedChallengeMstNo(challenge.CHALLENGE_MST_NO),
                  );
                }}>
                <ChallengeInfo
                  isSelected={
                    challenge.CHALLENGE_MST_NO === selectedChallengeMstNo
                  }
                  headerEmoji={challenge.HEADER_EMOJI}
                  mainText={challenge.CHALLENGE_MST_NM}
                  subText={
                    challenge.CHALLENGE_STATUS === ChallengeStatusType.PENDING
                      ? '시작전'
                      : `${Number(challenge.PROGRESS.toFixed(2))}% 진행됨`
                  }
                />
              </Pressable>
            ))}
          </RowScrollContainer>

          <NotoSansKR size={16}>초대된 챌린지</NotoSansKR>
          <RowScrollContainer gap={8}>
            {listData.invited_challenges?.map((challenge: ChallengeInfo) => {
              const leftDay = calculateDaysUntil(challenge.START_DT);
              return (
                <TouchableOpacity
                  key={challenge.CHALLENGE_MST_NO}
                  onPress={() =>
                    showModal(
                      <ChallengeListModal
                        count_challenge={listData.progress_challenges?.length}
                        challenge_mst_no={challenge.CHALLENGE_MST_NO}
                      />,
                    )
                  }>
                  <ChallengeSubInfo
                    headerEmoji={challenge.HEADER_EMOJI}
                    mainText={challenge.CHALLENGE_MST_NM}
                    subText={
                      leftDay === 0 ? '내일시작' : `${leftDay}일 뒤 시작`
                    }
                  />
                </TouchableOpacity>
              );
            })}
          </RowScrollContainer>

          <TouchableOpacity
            onPress={() => {
              if (listData.progress_challenges?.length >= 3) {
                Toast.show({
                  type: 'error',
                  text1: '현재는 챌린지를 3개까지만 진행할 수 있어요',
                });
              } else {
                navigation.navigate('CreateChallengeScreen' as never);
              }
            }}>
            <PlusContainers title="챌린지 시작하기" />
          </TouchableOpacity>
        </TopContainer>

        {detailData?.CHALLENGE_STATUS === ChallengeStatusType.PROGRESS ? (
          <>
            <CenterContainer>
              <RowContainer seperate>
                <NotoSansKR size={18}>개인별 목표</NotoSansKR>
              </RowContainer>
              <View style={{gap: 8}}>
                {personGoal.map(goal => (
                  <GoalBox
                    key={goal.id}
                    goal={goal}
                    challenge_no={selectedChallengeMstNo!}
                  />
                ))}
              </View>
              <TouchableOpacity
                onPress={() => {
                  showModal(
                    <PersonGoalAddModal
                      challenge_no={selectedChallengeMstNo!}
                    />,
                  );
                }}>
                <PlusContainers title="목표 추가하기" />
              </TouchableOpacity>
            </CenterContainer>
            <CenterContainer>
              <ButtonComponent
                onPress={() => {
                  showModal(
                    <MyDailyDrayModal
                      challenge_user_no={detailData.CHALLENGE_USER_NO}
                      personGoal={personGoal}
                    />,
                  );
                }}>
                일기 작성하기
              </ButtonComponent>
            </CenterContainer>
            {detailData?.additionalGoal.length !== 0 ? (
              <FootContainer>
                <RowContainer seperate>
                  <NotoSansKR size={18} color="white">
                    추가 목표
                  </NotoSansKR>
                  <MaterialCommunityIcons
                    name="bomb"
                    size={24}
                    color={'white'}
                  />
                </RowContainer>
                <View>
                  {detailData?.additionalGoal.map((data: AdditionalInfo) => {
                    return <ListItem key={data.ADDITIONAL_NO} data={data} />;
                  })}
                </View>
              </FootContainer>
            ) : (
              <FootContainer disalbed>
                <RowContainer seperate>
                  <NotoSansKR size={18} color="white">
                    추가 목표
                  </NotoSansKR>
                  <MaterialCommunityIcons
                    name="bomb"
                    size={24}
                    color={'white'}
                  />
                </RowContainer>
              </FootContainer>
            )}
          </>
        ) : (
          <CenterContainer style={{height: 300}}>
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                flex: 1,
                gap: 24,
              }}>
              <Image
                style={{height: 136}}
                source={require('../../assets/image/character/nuts05.png')}
                resizeMode="contain"
              />
              <NotoSansKR size={16} color="gray5">
                챌린지가 시작하지 않았어요!
              </NotoSansKR>
            </View>
          </CenterContainer>
        )}
      </HomeContainer>
    </ScrollView>
  );
};

export default ChallengeTab;
