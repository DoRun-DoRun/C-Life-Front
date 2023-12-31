import React, {useEffect, useState} from 'react';
import {Alert, TouchableOpacity, View} from 'react-native';
import {
  ButtonComponent,
  HomeContainer,
  InnerContainer,
  InputNotoSansKR,
  LoadingIndicatior,
  NotoSansKR,
  RowContainer,
  ScrollContainer,
  TossFace,
  convertKoKRToUTC,
  convertUTCToKoKR,
  getDayOfWeek,
  useApi,
} from '../Component';
import OcticonIcons from 'react-native-vector-icons/Octicons';
import EmojiPicker from 'rn-emoji-keyboard';
import {useDispatch, useSelector} from 'react-redux';
import {useMutation, useQuery, useQueryClient} from 'react-query';
import {RootState} from '../../store/Store';
import {useNavigation} from '@react-navigation/native';
import {
  CalendarContainer,
  DatePicker,
  InviteList,
  formatDate,
} from './CreateChallengeScreen';
import {setSelectedChallengeMstNo} from '../../store/slice/ChallengeSlice';
import {Toast} from 'react-native-toast-message/lib/src/Toast';
import {useModal} from '../Modal/ModalProvider';
import {ChallengeInviteFriend} from '../Modal/SearchBoxModal';
import {removeChallenge} from '../../store/slice/GoalSlice';

interface participantsDataType {
  UID: number;
  USER_NM: string;
  ACCEPT_STATUS: 'PENDING' | 'ACCEPTED';
}

const EditChallengeScreen = () => {
  const {accessToken} = useSelector((state: RootState) => state.user);
  const {selectedChallengeMstNo} = useSelector(
    (state: RootState) => state.challenge,
  );
  const dispatch = useDispatch();

  const queryClient = useQueryClient();
  const navigation = useNavigation();

  const [emojiOpen, setEmojiOpen] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState<string>();
  const [challengeName, setChallengeName] = useState('');
  const [calendarOpen, setCalendarOpen] = useState(false);

  const [calendarData, setCalendarData] = useState({start: '', end: ''});

  const [inviteListData, setInviteListData] = useState<InviteList[]>([]);
  const {showModal} = useModal();

  const CallApi = useApi();

  const getChallengeEdit = () =>
    CallApi({
      endpoint: `challenge/invite/${selectedChallengeMstNo}`,
      method: 'GET',
      accessToken: accessToken!,
    });

  const {data: challengeData, isLoading: loadingChallenge} = useQuery(
    'getChallengeEdit',
    getChallengeEdit,
  );

  const editChallenge = () =>
    CallApi({
      endpoint: `challenge/${selectedChallengeMstNo}`,
      method: 'PUT',
      accessToken: accessToken!,
      body: {
        CHALLENGE_MST_NM: challengeName,
        USERS_UID: inviteListData.map(item => ({
          USER_UID: item.UID,
          INVITE_STATS: item.accept ? 'ACCEPTED' : 'PENDING',
        })),
        START_DT: convertKoKRToUTC(calendarData.start).toISOString(),
        END_DT: convertKoKRToUTC(calendarData.end).toISOString(),
        HEADER_EMOJI: selectedEmoji,
      },
    });

  const {mutate: ChallengeEditMutate} = useMutation(editChallenge, {
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: '챌린지 정보가 수정되었어요.',
      });
      queryClient.invalidateQueries('getChallenge');
      queryClient.invalidateQueries('ChallengeUserList');
      queryClient.invalidateQueries('challenge_history');
      queryClient.invalidateQueries('userData');
      navigation.navigate('MainTab' as never);
    },
    onError: error => {
      console.error('Error:', error);
    },
  });

  const {mutate: ChallengeStartMutate} = useMutation(editChallenge, {
    onSuccess: () => {
      ChallengeStart();
    },
    onError: error => {
      console.error('Challenge Start Error:', error);
    },
  });

  const challengeStart = () =>
    CallApi({
      endpoint: `challenge/start?challenge_mst_no=${selectedChallengeMstNo}&start_dt=${convertKoKRToUTC(
        formatDate(new Date()),
      ).toISOString()}`,
      method: 'POST',
      accessToken: accessToken!,
    });

  const {mutate: ChallengeStart} = useMutation(challengeStart, {
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: '챌린지가 시작되었어요.',
      });
      queryClient.invalidateQueries('getChallenge');
      queryClient.invalidateQueries('getChallengeDetail');
      queryClient.invalidateQueries('ChallengeUserList');
      queryClient.invalidateQueries('challenge_history');
      queryClient.invalidateQueries('userData');
      navigation.navigate('MainTab' as never);
    },
    onError: error => {
      console.error('Challenge Start Error:', error);
    },
  });

  const challengeDelete = () =>
    CallApi({
      endpoint: `challenge/${selectedChallengeMstNo}`,
      method: 'DELETE',
      accessToken: accessToken!,
    });

  const {mutate: ChallengeDeleteMutation} = useMutation(challengeDelete, {
    onSuccess: () => {
      dispatch(setSelectedChallengeMstNo(null));

      // 상태 업데이트가 반영된 후 쿼리 무효화
      queryClient.invalidateQueries('getChallenge');
      queryClient.invalidateQueries('ChallengeUserList');
      queryClient.invalidateQueries('challenge_history');
      queryClient.invalidateQueries('userData');

      navigation.navigate('MainTab' as never);
    },

    onError: error => {
      console.error('Challenge Start Error:', error);
    },
  });

  useEffect(() => {
    if (challengeData !== undefined) {
      const listData = challengeData.PARTICIPANTS?.map(
        (participant: participantsDataType) => ({
          UserName: participant.USER_NM,
          UID: participant.UID,
          accept: participant.ACCEPT_STATUS === 'ACCEPTED',
        }),
      );

      setChallengeName(challengeData.CHALLENGE_MST_NM);
      setInviteListData(listData);
      setCalendarData({
        start: convertUTCToKoKR(challengeData.START_DT),
        end: convertUTCToKoKR(challengeData.END_DT),
      });
      setSelectedEmoji(challengeData.HEADER_EMOJI);
    }
  }, [
    challengeData,
    challengeData?.CHALLENGE_MST_NM,
    challengeData?.END_DT,
    challengeData?.HEADER_EMOJI,
    challengeData?.PARTICIPANTS,
    challengeData?.START_DT,
  ]);

  if (loadingChallenge) {
    return <LoadingIndicatior />;
  }

  return (
    <HomeContainer>
      <ScrollContainer>
        <InnerContainer gap={24}>
          {challengeData.CHALLENGE_STATUS === 'PENDING' ? (
            challengeData.IS_OWNER === false ? (
              <NotoSansKR size={20}>
                <NotoSansKR size={20} color="primary1">
                  대기중
                </NotoSansKR>
                인 챌린지 정보에요
              </NotoSansKR>
            ) : (
              <NotoSansKR size={20}>
                챌린지 내용을
                <NotoSansKR size={20} color="primary1">
                  수정{' '}
                </NotoSansKR>
                할 수 있어요
              </NotoSansKR>
            )
          ) : (
            <NotoSansKR size={20}>
              <NotoSansKR size={20} color="primary1">
                진행중
              </NotoSansKR>
              인 챌린지 정보에요
            </NotoSansKR>
          )}

          <RowContainer gap={16}>
            <TouchableOpacity
              onPress={() =>
                challengeData.CHALLENGE_STATUS === 'PENDING' &&
                challengeData.IS_OWNER !== false &&
                setEmojiOpen(true)
              }>
              {selectedEmoji ? (
                <TossFace size={40}>{selectedEmoji}</TossFace>
              ) : (
                <OcticonIcons name="plus-circle" size={40} />
              )}
            </TouchableOpacity>
            <View style={{flex: 1}}>
              <InputNotoSansKR
                maxLength={14}
                size={20}
                placeholder="챌린지 목표"
                onChangeText={setChallengeName}
                value={challengeName}
                editable={
                  challengeData.CHALLENGE_STATUS === 'PENDING' &&
                  challengeData.IS_OWNER !== false
                }
              />
            </View>
          </RowContainer>

          <View style={{gap: 8}}>
            <NotoSansKR size={18}>챌린지 기간</NotoSansKR>

            <DatePicker
              onPress={() => {
                challengeData.CHALLENGE_STATUS === 'PENDING' &&
                  challengeData.IS_OWNER !== false &&
                  setCalendarOpen(true);
              }}>
              {calendarData.end && calendarData.start ? (
                <NotoSansKR size={14} weight="Medium" color="gray2">
                  {`${calendarData.start} (${getDayOfWeek(
                    calendarData.start,
                  )}) ~ ${calendarData.end} (${getDayOfWeek(
                    calendarData.end,
                  )})`}
                </NotoSansKR>
              ) : (
                <NotoSansKR size={14} weight="Medium" color="gray4">
                  시작날짜와 종료날짜를 선택해주세요
                </NotoSansKR>
              )}
            </DatePicker>
          </View>

          <View style={{gap: 12}}>
            <NotoSansKR size={18}>참여중인 인원</NotoSansKR>

            {inviteListData?.map((data, key) => (
              <InviteList
                key={key}
                UserName={data.UserName}
                UID={data.UID}
                accept={data.accept}
                setInviteListData={setInviteListData}
              />
            ))}
          </View>

          {/* {!searchOpen ? <OcticonIcons name="plus-circle" size={24} /> : null} */}
        </InnerContainer>
      </ScrollContainer>

      {challengeData.CHALLENGE_STATUS === 'PENDING' &&
      challengeData.IS_OWNER !== false ? (
        <View style={{gap: 8, padding: 16}}>
          <ButtonComponent
            onPress={() => {
              const missingItems = [];

              if (!challengeName) {
                missingItems.push('챌린지 목표');
              }
              if (!calendarData.start || !calendarData.end) {
                missingItems.push('챌린지 날짜');
              }
              if (!selectedEmoji) {
                missingItems.push('이모지');
              }

              if (missingItems.length > 0) {
                Toast.show({
                  type: 'error',
                  text1: '모든 항목을 채워주세요',
                  text2: missingItems.join(', ') + '을(를) 작성해주세요.',
                });
                return;
              }

              Alert.alert(
                '챌린지 시작', // 대화상자 제목
                `해당 챌린지는 ${calendarData.start}에 시작하도록 되어있어요.\n기다리지 않고 챌린지를 바로 시작할까요?`, // 메시지
                [
                  {
                    text: '기다릴래요',
                    style: 'cancel',
                  },
                  {
                    text: '시작할래요',
                    onPress: () => {
                      ChallengeStartMutate();
                    },
                    style: 'destructive',
                  },
                ],
                {cancelable: false}, // 바깥쪽을 눌러 대화상자를 닫을 수 없도록 설정
              );
            }}>
            지금 시작하기
          </ButtonComponent>
          <ButtonComponent
            type="secondary"
            onPress={() => {
              showModal(
                <ChallengeInviteFriend
                  setInviteListData={setInviteListData}
                  inviteListData={inviteListData}
                />,
              );
            }}>
            친구 초대하기
          </ButtonComponent>
          <RowContainer gap={8}>
            <View style={{flex: 1}}>
              <ButtonComponent
                type="secondary"
                onPress={() => {
                  const missingItems = [];

                  if (!challengeName) {
                    missingItems.push('챌린지 목표');
                  }
                  if (!calendarData.start || !calendarData.end) {
                    missingItems.push('챌린지 날짜');
                  }
                  if (!selectedEmoji) {
                    missingItems.push('이모지');
                  }

                  if (missingItems.length > 0) {
                    Toast.show({
                      type: 'error',
                      text1: '모든 항목을 채워주세요',
                      text2: missingItems.join(', ') + '을(를) 작성해주세요.',
                    });
                    return;
                  }

                  if (calendarData.start === formatDate(new Date())) {
                    Toast.show({
                      type: 'error',
                      text1: '챌린지 시작날짜를 오늘로 변경할 수 없습니다.',
                    });
                    return;
                  }
                  ChallengeEditMutate();
                }}>
                수정하기
              </ButtonComponent>
            </View>
            <View style={{flex: 1}}>
              <ButtonComponent
                type="secondary"
                onPress={() => {
                  Alert.alert(
                    '', // 대화상자 제목
                    '정말로 챌린지를 삭제하시겠습니까?', // 메시지
                    [
                      {
                        text: '취소',
                        style: 'cancel',
                      },
                      {
                        text: '삭제하기',
                        onPress: () => {
                          ChallengeDeleteMutation(); // 챌린지 삭제 함수 호출
                        },
                        style: 'destructive',
                      },
                    ],
                    {cancelable: false}, // 바깥쪽을 눌러 대화상자를 닫을 수 없도록 설정
                  );
                }}>
                삭제하기
              </ButtonComponent>
            </View>
          </RowContainer>
        </View>
      ) : (
        <View style={{gap: 8, padding: 16}}>
          <ButtonComponent
            type="primary"
            onPress={() => {
              Alert.alert(
                '', // 대화상자 제목
                '정말로 챌린지를 그만두시겠습니까?', // 메시지
                [
                  {
                    text: '취소',
                    style: 'cancel',
                  },
                  {
                    text: '그만두기',
                    onPress: () => {
                      ChallengeDeleteMutation(); // 챌린지 삭제 함수 호출
                      dispatch(removeChallenge(selectedChallengeMstNo!));
                    },
                    style: 'destructive',
                  },
                ],
                {cancelable: false}, // 바깥쪽을 눌러 대화상자를 닫을 수 없도록 설정
              );
            }}>
            챌린지 중단하기
          </ButtonComponent>
        </View>
      )}

      <EmojiPicker
        onEmojiSelected={emojiObject => setSelectedEmoji(emojiObject.emoji)}
        open={emojiOpen}
        onClose={() => setEmojiOpen(false)}
      />

      {calendarOpen ? (
        <CalendarContainer
          calendarData={calendarData}
          setCalendarOpen={setCalendarOpen}
          setCalendarData={setCalendarData}
        />
      ) : null}
    </HomeContainer>
  );
};

export default EditChallengeScreen;
