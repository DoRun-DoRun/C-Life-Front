import React from 'react';
import styled from 'styled-components/native';

interface ButtonType {
  children: React.ReactNode;
  type?: 'primary' | 'secondary' | 'gray';
  onPress?: () => void;
}

const ButtonContainer = styled.TouchableOpacity<{color: string}>`
  background-color: ${props => props.theme[props.color]};
  padding: 8px;
  width: 100%;
  align-items: center;
  border-radius: 10px;
`;

interface FontType {
  size: number;
  weight?: 'Bold' | 'Medium' | 'Regular';
  color?: string;
  lineHeight?: number;
  border?: boolean;
}

export const NotoSansKR = styled.Text<FontType>`
  color: ${({color, theme}) => (color ? theme[color] : theme.black)};
  /* 안드로이드에서 font 오류 */
  /* font-family: ${({weight}) => `NotoSansKR-${weight || 'Bold'}`}; */
  line-height: ${({lineHeight, size}) =>
    lineHeight ? lineHeight + 'px' : size * 1.75 + 'px'};
  font-size: ${({size}) => size + 'px'};
`;

export const InputNotoSansKR = styled.TextInput<FontType>`
  color: ${({color, theme}) => (color ? theme[color] : theme.black)};
  /* 안드로이드에서 font 오류 */
  /* font-family: ${({weight}) => `NotoSansKR-${weight || 'Bold'}`}; */
  line-height: ${({lineHeight, size}) =>
    lineHeight ? lineHeight + 'px' : size * 1.45 + 'px'};
  font-size: ${({size}) => size + 'px'};
  padding: 0;
  padding-bottom: 4px;
  margin: 0;
  border-bottom-width: ${({border}) => (border ? '1px' : 0)};
`;

export const TossFace = styled.Text<{size: number}>`
  font-size: ${({size}) => size + 'px'};
  line-height: ${({size}) => size * 2 + 'px'};
  font-family: 'TossFaceFontMac';
`;

export const InnerContainer = styled.View<{gap?: number; seperate?: boolean}>`
  flex: 1;
  padding: 16px;
  text-align: left;
  justify-content: ${props =>
    props.seperate ? 'space-between' : 'flex-start'};
`;

export const HomeContainer = styled.SafeAreaView`
  position: relative;
  flex: 1;
  background-color: #fff;
`;

export const ScrollContainer = styled.ScrollView.attrs({
  showsHorizontalScrollIndicator: false,
  showsVerticalScrollIndicator: false,
})`
  flex: 1;
`;

const RowScrollView = styled.View`
  flex-direction: row;
  padding: 0 16px;
`;

interface ScrollContainerType {
  children: React.ReactNode;
  gap?: number;
}

export const RowScrollContainer = ({children, gap}: ScrollContainerType) => {
  return (
    <ScrollContainer horizontal style={{marginLeft: -16, marginRight: -16}}>
      <RowScrollView style={{gap: gap}}>{children}</RowScrollView>
    </ScrollContainer>
  );
};

export const ButtonComponent = ({children, type, onPress}: ButtonType) => {
  let color = 'white';
  let backgroundColor = 'primary1';

  if (type === 'secondary') {
    color = 'gray4';
    backgroundColor = 'white';
  } else if (type === 'gray') {
    color = 'gray4';
    backgroundColor = 'gray7';
  }

  return (
    <ButtonContainer color={backgroundColor} onPress={onPress}>
      <NotoSansKR color={color} size={16} lineHeight={23}>
        {children}
      </NotoSansKR>
    </ButtonContainer>
  );
};

export const RowContainer = styled.View<{gap?: number; seperate?: boolean}>`
  flex-direction: row;
  align-items: center;
  justify-content: ${props =>
    props.seperate ? 'space-between' : 'flex-start'};
`;
