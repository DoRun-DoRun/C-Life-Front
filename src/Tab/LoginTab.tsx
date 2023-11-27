import React, {useEffect} from 'react';
import {CallApi, HomeContainer, NotoSansKR, RowContainer} from '../Component';
import {styled} from 'styled-components/native';
import {Alert, Platform, TouchableOpacity} from 'react-native';
import {useMutation} from 'react-query';
import {setUser} from '../../store/slice/UserSlice';
import {
  loadUser,
  persistUser,
  userDataType,
} from '../../store/async/asyncStore';
import {useDispatch} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {
  KakaoOAuthToken,
  KakaoProfile,
  KakaoProfileNoneAgreement,
  getProfile,
  login,
} from '@react-native-seoul/kakao-login';

import {appleAuth} from '@invertase/react-native-apple-authentication';
import {appleAuthAndroid} from '@invertase/react-native-apple-authentication';
// import 'react-native-get-random-values';
import {v4 as uuid} from 'uuid';

const signInWithApple = async () => {
  // performs login request
  if (Platform.OS === 'android') {
    // Android 기기에서 실행되는 코드
    console.log('This is an Android device');

    // Generate secure, random values for state and nonce
    const rawNonce = uuid();
    const state = uuid();

    // Configure the request
    appleAuthAndroid.configure({
      // The Service ID you registered with Apple
      clientId: 'com.example.CLife',

      // Return URL added to your Apple dev console. We intercept this redirect, but it must still match
      // the URL you provided to Apple. It can be an empty route on your backend as it's never called.
      // redirectUri: 'https://dorun.site/auth/callback',
      redirectUri: '',

      // The type of response requested - code, id_token, or both.
      responseType: appleAuthAndroid.ResponseType.ALL,

      // The amount of user information requested from Apple.
      scope: appleAuthAndroid.Scope.ALL,

      // Random nonce value that will be SHA256 hashed before sending to Apple.
      nonce: rawNonce,

      // Unique state value used to prevent CSRF attacks. A UUID will be generated if nothing is provided.
      state,
    });

    // Open the browser window for user sign in
    const response = await appleAuthAndroid.signIn();

    Alert.alert('response값', response.toString(), [
      {text: '취소', onPress: () => console.log('취소됨')},
      {text: '확인', onPress: () => console.log('확인됨')},
    ]);
  } else {
    // 다른 플랫폼(예: iOS)에서 실행되는 코드
    console.log('This is not an Android device');

    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,

      // Note: it appears putting FULL_NAME first is important, see issue #293
      requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
    });

    Alert.alert('response값', appleAuthRequestResponse.toString(), [
      {text: '취소', onPress: () => console.log('취소됨')},
      {text: '확인', onPress: () => console.log('확인됨')},
    ]);
    console.log(appleAuthRequestResponse);

    // get current authentication state for user
    // /!\ This method must be tested on a real device. On the iOS simulator it always throws an error.
    const credentialState = await appleAuth.getCredentialStateForUser(
      appleAuthRequestResponse.user,
    );

    // console.log(credentialState);

    // use credentialState response to ensure the user is authenticated
    if (credentialState === appleAuth.State.AUTHORIZED) {
      // user is authenticated
    }
  }
};

const signInWithKakao = async (): Promise<void> => {
  try {
    const token: KakaoOAuthToken = await login();
    console.log(token);

    // setResult(JSON.stringify(token));
  } catch (err) {
    console.log(err);
  }
};

const getKakaoProfile = async (): Promise<void> => {
  try {
    const profile: KakaoProfile | KakaoProfileNoneAgreement =
      await getProfile();
    console.log(profile);
  } catch (err) {
    console.log(err);
  }
};

const guestLogin = () =>
  CallApi({endpoint: 'user/create/guest', method: 'POST'});

const LoginTab = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  useEffect(() => {
    const bootstrapAsync = async () => {
      const userData = await loadUser();
      if (userData) {
        dispatch(setUser(userData));
        navigation.navigate('MainTab' as never);
      }
    };

    bootstrapAsync();
  }, [dispatch, navigation]);

  const {
    mutate: login_guest,
    isLoading,
    error,
  } = useMutation(guestLogin, {
    onSuccess: response => {
      // 요청 성공 시 수행할 작업
      const userData: userDataType = {
        UID: response.UID,
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        userName: 'Guest',
      };

      dispatch(setUser(userData));
      persistUser(userData);
      console.log('Success:', userData);
      navigation.navigate('MainTab' as never);
    },
    onError: () => {
      // 요청 실패 시 수행할 작업
      console.error('Error:', error);
    },
  });

  return (
    <HomeContainer>
      <BackgroundImage source={require('../../assets/image/background.png')} />
      <LoginContainer>
        <Title source={require('../../assets/image/title.png')} />
        <LoginButton
          kakao
          onPress={() => {
            signInWithKakao();
            getKakaoProfile();
          }}>
          <RowContainer gap={8}>
            <IconImage
              source={require('../../assets/image/kakao_icon.png')}
              size={24}
            />
            <NotoSansKR size={14} style={{flex: 1, textAlign: 'center'}}>
              카카오톡으로 시작하기
            </NotoSansKR>
          </RowContainer>
        </LoginButton>
        <LoginButton onPress={() => signInWithApple()}>
          <RowContainer gap={8}>
            <IconImage
              source={require('../../assets/image/apple_icon.png')}
              size={20}
            />
            <NotoSansKR size={14} style={{flex: 1, textAlign: 'center'}}>
              애플로 시작하기
            </NotoSansKR>
          </RowContainer>
        </LoginButton>
        <TouchableOpacity
          onPress={() => {
            if (isLoading) {
              console.log('Guest login is already in progress.');
              return;
            } else {
              login_guest();
            }
          }}>
          <NotoSansKR
            size={14}
            weight="Medium"
            color="white"
            style={{
              textDecorationLine: 'underline',
              textAlign: 'center',
            }}>
            게스트 계정으로 시작하기
          </NotoSansKR>
        </TouchableOpacity>
      </LoginContainer>
    </HomeContainer>
  );
};

const BackgroundImage = styled.ImageBackground`
  position: absolute;
  width: 100%;
  height: 100%;
  resize: contain;
  flex: 1;
  bottom: 0;
`;

const LoginContainer = styled.View`
  flex: 1;
  justify-content: flex-end;
  align-items: center;
  padding: 32px;
  gap: 6px;
`;

const Title = styled.Image`
  margin-bottom: 4px;
`;
const IconImage = styled.Image<{size: number}>`
  width: ${({size}) => `${size}px`};
  height: ${({size}) => `${size}px`};
`;

const LoginButton = styled.TouchableOpacity<{kakao?: boolean}>`
  margin-top: 6px;
  width: 193px;
  background-color: ${({kakao}) => (kakao ? '#fddc3f' : '#fff')};
  padding: 8px 16px 8px 12px;
  border-radius: 5px;
`;

export default LoginTab;