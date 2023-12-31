import React, {Dispatch, SetStateAction, useEffect, useState} from 'react';
import {Modal, TouchableOpacity, View} from 'react-native';
import {
  ButtonComponent,
  HomeContainer,
  InnerContainer,
  InputNotoSansKR,
  NotoSansKR,
  RowContainer,
  ScrollContainer,
  TossFace,
  convertKoKRToUTC,
  formatDateToYYYYMM,
  getDayOfWeek,
  useApi,
} from '../Component';
import OcticonIcons from 'react-native-vector-icons/Octicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {styled, useTheme} from 'styled-components/native';
import EmojiPicker from 'rn-emoji-keyboard';
import {Calendar} from 'react-native-calendars';
import {useSelector} from 'react-redux';
import {useMutation, useQueryClient} from 'react-query';
import {RootState} from '../../store/Store';
import {useNavigation} from '@react-navigation/native';
import {Toast} from 'react-native-toast-message/lib/src/Toast';
import {Alert} from 'react-native';
import {Direction} from 'react-native-calendars/src/types';
import {useModal} from '../Modal/ModalProvider';
import {ChallengeInviteFriend} from '../Modal/SearchBoxModal';

export const DatePicker = styled.TouchableOpacity`
  border: 1px solid ${props => props.theme.gray5};
  padding: 8px;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
`;

export interface InviteList {
  UserName: string;
  UID: number;
  accept?: boolean;
}

interface InviteListType {
  UserName: string;
  UID: number;
  accept?: boolean;
  setInviteListData: Dispatch<SetStateAction<InviteList[]>>;
}

export const InviteList = ({
  UserName,
  accept,
  UID,
  setInviteListData,
}: InviteListType) => {
  return (
    <RowContainer seperate>
      <NotoSansKR size={16} weight="Medium">
        {UserName}
      </NotoSansKR>
      <RowContainer gap={9}>
        <NotoSansKR size={14} weight="Regular" color={accept ? 'green' : 'red'}>
          {accept ? '참여 중' : '대기 중'}
        </NotoSansKR>
        {!accept && (
          <TouchableOpacity
            onPress={() => {
              setInviteListData(prev => prev.filter(item => item.UID !== UID));
            }}>
            <NotoSansKR
              size={14}
              weight="Regular"
              color="gray3"
              style={{textDecorationLine: 'underline'}}>
              취소하기
            </NotoSansKR>
          </TouchableOpacity>
        )}
      </RowContainer>
    </RowContainer>
  );
};

interface EmojiType {
  emoji: string;
  name: string;
  slug: string;
  unicode_version: string;
}
interface Day {
  dateString: string;
  day: number;
  month: number;
  year: number;
  timestamp: number;
}

interface MarkedDataType {
  [date: string]: {
    startingDay?: boolean;
    endingDay?: boolean;
    marked?: boolean;
    dotColor?: string;
    color?: string;
    textColor?: string;
  };
}

export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const CalendarView = styled.TouchableOpacity`
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 1;
  justify-content: flex-end;
  padding: 16px;
  background-color: rgba(0, 0, 0, 0.3);
`;

const CalendarModalContainer = styled.Pressable`
  padding-top: 10px;
  margin-bottom: 24px;
  background-color: #fff;
  border-radius: 12px;
  z-index: 2;
`;

const CalendarRowContainer = styled(RowContainer)`
  justify-content: flex-end;
  border-top-width: 1px;
  padding: 8px;
  border-color: ${props => props.theme.primary1};
`;

export const CalendarContainer = ({
  setCalendarOpen,
  setCalendarData,
  calendarData,
}: {
  setCalendarOpen: Dispatch<SetStateAction<boolean>>;
  setCalendarData: Dispatch<SetStateAction<{start: string; end: string}>>;
  calendarData: {start: string; end: string};
}) => {
  const [markedDates, setMarkedDates] = useState<MarkedDataType>({});
  const [disabledLeft, setDisabledLeft] = useState(true);

  const theme = useTheme();
  const currentDate = new Date();

  useEffect(() => {
    if (calendarData.start !== '' && calendarData.end !== '') {
      const {start, end} = calendarData;
      if (start === end) {
        setMarkedDates({
          [start]: {
            startingDay: true,
            endingDay: true,
            color: theme.primary1,
            textColor: 'white',
          },
        });
      } else {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const newMarkedDates = {...markedDates};

        let day = new Date(startDate);
        day.setDate(day.getDate() + 1); // 시작 날짜 다음 날부터 순회 시작

        newMarkedDates[start] = {
          startingDay: true,
          color: theme.primary1,
          textColor: 'white',
        };

        while (day < endDate) {
          const dayStr = formatDate(day);
          newMarkedDates[dayStr] = {
            marked: true,
            dotColor: 'transparent',
            color: theme.primary1,
            textColor: 'white',
          };
          day.setDate(day.getDate() + 1);
        }

        newMarkedDates[end] = {
          endingDay: true,
          color: theme.primary1,
          textColor: 'white',
        };

        setMarkedDates(newMarkedDates);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDayPress = (date: Day) => {
    const {dateString} = date;

    const newDates = {...markedDates};
    if (newDates.start && newDates.end) {
      // 이미 시작과 종료 날짜가 선택되었다면 초기화
      setMarkedDates({});
    }

    const keys = Object.keys(markedDates);
    if (keys.length === 1) {
      const [start] = keys;

      // 두 날짜를 Date 객체로 변환
      const startDate = new Date(start);
      const endDate = new Date(dateString);

      // 시작 날짜가 종료 날짜보다 클 경우 종료 날짜를 시작으로, 시작 날짜를 종료로 설정
      if (startDate >= endDate) {
        setMarkedDates({
          [dateString]: {
            startingDay: true,
            endingDay: true,
            color: theme.primary1,
            textColor: 'white',
          },
        });
        return;
      }

      // 시작, 종료 날짜 및 사이의 모든 날짜를 markedDates 객체에 추가
      const newMarkedDates: MarkedDataType = {
        [start]: {startingDay: true, color: theme.primary1, textColor: 'white'},
        [dateString]: {
          endingDay: true,
          color: theme.primary1,
          textColor: 'white',
        },
      };

      const day = new Date(startDate);
      day.setDate(day.getDate() + 1); // 시작 날짜 다음 날부터 순회 시작

      while (day < endDate) {
        const dayStr = formatDate(day);
        newMarkedDates[dayStr] = {
          marked: true,
          dotColor: 'transparent',
          color: theme.primary1,
          textColor: 'white',
        };
        day.setDate(day.getDate() + 1);
      }
      setMarkedDates(newMarkedDates);
    } else {
      setMarkedDates({
        [dateString]: {
          startingDay: true,
          endingDay: true,
          color: theme.primary1,
          textColor: 'white',
        },
      });
    }
  };

  const sendCalendarData = () => {
    setCalendarOpen(false);
    const keys = Object.keys(markedDates);
    if (keys.length !== 0) {
      setCalendarData({
        start: keys![0],
        end: keys.length === 1 ? keys![0] : keys![1],
      });
    }
  };

  return (
    <Modal transparent={true}>
      <CalendarView onPress={() => setCalendarOpen(false)}>
        <CalendarModalContainer onPress={e => e.stopPropagation()}>
          <Calendar
            onMonthChange={e =>
              e.month !== currentDate.getMonth() + 1
                ? setDisabledLeft(false)
                : setDisabledLeft(true)
            }
            allowShadow
            renderArrow={(direction: Direction) =>
              direction === 'left' ? (
                !disabledLeft ? (
                  <MaterialIcons
                    name="arrow-back"
                    size={20}
                    color={theme.primary1}
                  />
                ) : (
                  <View style={{width: 20}} />
                )
              ) : (
                <MaterialIcons
                  name="arrow-forward"
                  size={20}
                  color={theme.primary1}
                />
              )
            }
            renderHeader={(date: string) => (
              <NotoSansKR size={16}>{formatDateToYYYYMM(date)}</NotoSansKR>
            )}
            disableArrowLeft={disabledLeft}
            // monthFormat="yy년 MM월"
            minDate={formatDate(new Date())}
            onDayPress={onDayPress}
            markingType={'period'}
            markedDates={markedDates}
          />
          <CalendarRowContainer gap={16}>
            <TouchableOpacity
              style={{padding: 10}}
              onPress={() => setCalendarOpen(false)}>
              <NotoSansKR size={14} color="primary1">
                취소
              </NotoSansKR>
            </TouchableOpacity>

            <TouchableOpacity style={{padding: 10}} onPress={sendCalendarData}>
              <NotoSansKR size={14} color="primary1">
                선택하기
              </NotoSansKR>
            </TouchableOpacity>
          </CalendarRowContainer>
        </CalendarModalContainer>
      </CalendarView>
    </Modal>
  );
};

const CreateChallengeScreen = () => {
  const {accessToken, userName, UID} = useSelector(
    (state: RootState) => state.user,
  );
  const queryClient = useQueryClient();
  const navigation = useNavigation();

  // const validAccessToken = accessToken || '기본값 또는 대체값';
  const validUserName = userName || '기본 사용자 이름';
  const validUID = UID || 1000000;

  const [emojiOpen, setEmojiOpen] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState<EmojiType>();
  const [challengeName, setChallengeName] = useState('');
  const [calendarOpen, setCalendarOpen] = useState(false);

  const [calendarData, setCalendarData] = useState({start: '', end: ''});

  const [inviteListData, setInviteListData] = useState<InviteList[]>([
    {UserName: validUserName, UID: validUID, accept: true},
  ]);
  const CallApi = useApi();

  const {showModal} = useModal();

  const createChallenge = () =>
    CallApi({
      endpoint: 'challenge',
      method: 'POST',
      accessToken: accessToken!,
      body: {
        CHALLENGE_MST_NM: challengeName,
        USERS_UID: inviteListData.map(item => ({
          USER_UID: item.UID,
          INVITE_STATS: item.accept ? 'ACCEPTED' : 'PENDING',
        })),
        START_DT: convertKoKRToUTC(calendarData.start).toISOString(),
        END_DT: convertKoKRToUTC(calendarData.end).toISOString(),
        HEADER_EMOJI: selectedEmoji?.emoji,
      },
    });

  const {mutate: ChallengeCreateMutate} = useMutation(createChallenge, {
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: '챌린지가 생성되었어요.',
      });
      queryClient.invalidateQueries('getChallenge');
      navigation.navigate('MainTab' as never);
    },
    onError: error => {
      console.error('Error:', error);
    },
  });

  const {mutate: ChallengeStartMutate} = useMutation(createChallenge, {
    onSuccess: response => {
      ChallengeStart(response.CHALLENGE_MST_NO);
    },
    onError: error => {
      console.error('Error:', error);
    },
  });

  const challengeStart = (selectedChallengeMstNo: number) =>
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

  return (
    <HomeContainer>
      <ScrollContainer>
        <InnerContainer gap={24}>
          <NotoSansKR size={20}>
            <NotoSansKR size={20} color="primary1">
              도전
            </NotoSansKR>
            을 시작해볼까요?
          </NotoSansKR>

          <RowContainer gap={16}>
            <TouchableOpacity
              onPress={() => setEmojiOpen(true)}
              style={{
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              {selectedEmoji ? (
                <TossFace size={40}>{selectedEmoji?.emoji}</TossFace>
              ) : (
                <OcticonIcons name="plus-circle" size={40} color={'black'} />
              )}
            </TouchableOpacity>
            <InputNotoSansKR
              maxLength={14}
              style={{height: 40}}
              size={20}
              placeholder="챌린지 목표"
              onChangeText={setChallengeName}
              value={challengeName}
            />
          </RowContainer>

          <View style={{gap: 8}}>
            <NotoSansKR size={18}>챌린지 기간</NotoSansKR>

            <DatePicker
              onPress={() => {
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

          <View style={{gap: 16}}>
            <View style={{gap: 12}}>
              <NotoSansKR size={18}>참여중인 인원</NotoSansKR>

              {inviteListData.map((data, key) => (
                <InviteList
                  key={key}
                  UserName={data.UserName}
                  UID={data.UID}
                  accept={data.accept}
                  setInviteListData={setInviteListData}
                />
              ))}
            </View>
          </View>
          {/* <NotoSansKR size={16}>챌린지는 04시에 시작 & 완료되어요</NotoSansKR> */}
          {/* <RowContainer gap={8}>
            {!searchOpen ? <OcticonIcons name="plus-circle" size={24} /> : null}
          </RowContainer> */}
        </InnerContainer>
      </ScrollContainer>

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

            if (calendarData.start === formatDate(new Date())) {
              Alert.alert(
                '챌린지 시작 날짜가 오늘입니다.', // 경고 제목
                '친구들을 기다리지 않고 바로 시작할까요?', // 경고 메시지
                [
                  {
                    text: '날짜 변경하기',
                    style: 'cancel',
                    onPress: () => setCalendarOpen(true),
                  },
                  {
                    text: '바로 시작하기',
                    onPress: () => ChallengeStartMutate(),
                    style: 'destructive',
                  },
                ],
                {cancelable: false},
              );
            } else {
              ChallengeCreateMutate();
            }
          }}>
          챌린지 생성하기
        </ButtonComponent>
        <ButtonComponent
          type="secondary"
          onPress={() =>
            showModal(
              <ChallengeInviteFriend
                setInviteListData={setInviteListData}
                inviteListData={inviteListData}
              />,
            )
          }>
          친구 초대하기
        </ButtonComponent>
      </View>

      <EmojiPicker
        onEmojiSelected={emojiObject => setSelectedEmoji(emojiObject)}
        open={emojiOpen}
        onClose={() => setEmojiOpen(false)}
      />

      {calendarOpen && (
        <CalendarContainer
          calendarData={calendarData}
          setCalendarOpen={setCalendarOpen}
          setCalendarData={setCalendarData}
        />
      )}
    </HomeContainer>
  );
};
export default CreateChallengeScreen;
