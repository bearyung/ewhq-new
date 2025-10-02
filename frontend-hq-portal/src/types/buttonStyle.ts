export interface ButtonStyle {
  buttonStyleId: number;
  accountId: number;
  styleName: string;
  styleNameAlt?: string;
  resourceStyleName?: string;
  backgroundColorTop?: string;
  backgroundColorMiddle?: string;
  backgroundColorBottom?: string;
  enabled: boolean;
  fontSize: number;
  width?: number;
  height?: number;
  imageModeWidth?: number;
  imageModeHeight?: number;
  imageModeFontSize?: number;
  imageModeResourceStyleName?: string;
  isSystemUse?: boolean;
  createdDate?: Date;
  createdBy?: string;
  modifiedDate?: Date;
  modifiedBy?: string;
  fontColor?: string;
}

export interface CreateButtonStyle {
  styleName: string;
  styleNameAlt?: string;
  resourceStyleName?: string;
  backgroundColorTop?: string;
  backgroundColorMiddle?: string;
  backgroundColorBottom?: string;
  enabled: boolean;
  fontSize: number;
  width?: number;
  height?: number;
  imageModeWidth?: number;
  imageModeHeight?: number;
  imageModeFontSize?: number;
  imageModeResourceStyleName?: string;
}

export type UpdateButtonStyle = CreateButtonStyle;