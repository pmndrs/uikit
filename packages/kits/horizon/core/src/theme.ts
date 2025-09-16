import { isDarkMode, withOpacity } from '@pmndrs/uikit'
import { computed, Signal } from '@preact/signals-core'

const lightTheme = {
  component: {
    button: {
      primary: {
        background: {
          fill: {
            default: withOpacity('#272727', 1),
            hovered: withOpacity('#5a5a5a', 1),
            pressed: withOpacity('#747474', 1),
            disabled: withOpacity('#c0c0c0', 1),
          },
          border: {
            default: withOpacity('#000000', 0),
            hovered: withOpacity('#000000', 0),
            pressed: withOpacity('#000000', 0),
          },
        },
        label: {
          default: withOpacity('#ffffff', 0.9),
          hovered: withOpacity('#ffffff', 0.9),
          pressed: withOpacity('#ffffff', 0.9),
          disabled: withOpacity('#f2f2f2', 1),
        },
        icon: {
          default: withOpacity('#ffffff', 0.9),
          hovered: withOpacity('#ffffff', 0.9),
          pressed: withOpacity('#ffffff', 0.9),
          disabled: withOpacity('#f2f2f2', 1),
        },
        subtext: {
          default: withOpacity('#ffffff', 0.7),
          hovered: withOpacity('#ffffff', 0.7),
          pressed: withOpacity('#ffffff', 0.7),
          disabled: withOpacity('#ffffff', 0.6),
        },
      },
      secondary: {
        label: {
          default: withOpacity('#272727', 1),
          hovered: withOpacity('#272727', 1),
          pressed: withOpacity('#272727', 1),
          disabled: withOpacity('#272727', 0.3),
        },
        icon: {
          default: withOpacity('#272727', 1),
          hovered: withOpacity('#272727', 1),
          pressed: withOpacity('#272727', 1),
          disabled: withOpacity('#272727', 0.3),
        },
        background: {
          fill: {
            default: withOpacity('#272727', 0.05),
            hovered: withOpacity('#272727', 0.1),
            pressed: withOpacity('#272727', 0.2),
            disabled: withOpacity('#272727', 0.05),
          },
          border: {
            default: withOpacity('#000000', 0),
            hovered: withOpacity('#000000', 0),
            pressed: withOpacity('#000000', 0),
          },
        },
        subtext: {
          default: withOpacity('#272727', 0.7),
          hovered: withOpacity('#272727', 0.7),
          pressed: withOpacity('#272727', 0.7),
          disabled: withOpacity('#272727', 0.3),
        },
      },
      tertiary: {
        label: {
          default: withOpacity('#272727', 1),
          hovered: withOpacity('#272727', 1),
          pressed: withOpacity('#272727', 1),
          disabled: withOpacity('#272727', 0.3),
        },
        icon: {
          default: withOpacity('#272727', 1),
          hovered: withOpacity('#272727', 1),
          pressed: withOpacity('#272727', 1),
          disabled: withOpacity('#272727', 0.3),
        },
        background: {
          fill: {
            default: withOpacity('#272727', 0),
            hovered: withOpacity('#272727', 0.1),
            pressed: withOpacity('#272727', 0.15),
            disabled: withOpacity('#272727', 0),
          },
          border: {
            default: withOpacity('#000000', 0),
            hovered: withOpacity('#000000', 0),
            pressed: withOpacity('#000000', 0),
          },
        },
        subtext: {
          default: withOpacity('#272727', 0.7),
          hovered: withOpacity('#272727', 0.7),
          pressed: withOpacity('#272727', 0.7),
          disabled: withOpacity('#272727', 0.3),
        },
      },
      onMedia: {
        label: {
          default: withOpacity('#ffffff', 0.9),
          hovered: withOpacity('#ffffff', 0.9),
          pressed: withOpacity('#ffffff', 0.9),
          disabled: withOpacity('#ffffff', 0.35),
        },
        icon: {
          default: withOpacity('#ffffff', 0.9),
          hovered: withOpacity('#ffffff', 0.9),
          pressed: withOpacity('#ffffff', 0.9),
          disabled: withOpacity('#ffffff', 0.35),
        },
        background: {
          fill: {
            default: withOpacity('#ffffff', 0),
            hovered: withOpacity('#ffffff', 0.1),
            pressed: withOpacity('#ffffff', 0.2),
            disabled: withOpacity('#ffffff', 0),
          },
          border: {
            default: withOpacity('#000000', 0),
            hovered: withOpacity('#000000', 0),
            pressed: withOpacity('#000000', 0),
          },
        },
        subtext: {
          default: withOpacity('#ffffff', 0.7),
          hovered: withOpacity('#ffffff', 0.7),
          pressed: withOpacity('#ffffff', 0.7),
          disabled: withOpacity('#ffffff', 0.35),
        },
      },
      positive: {
        label: {
          default: withOpacity('#ffffff', 0.9),
          hovered: withOpacity('#ffffff', 0.9),
          pressed: withOpacity('#ffffff', 0.9),
          disabled: withOpacity('#f2f2f2', 1),
        },
        icon: {
          default: withOpacity('#ffffff', 0.9),
          hovered: withOpacity('#ffffff', 0.9),
          pressed: withOpacity('#ffffff', 0.9),
          disabled: withOpacity('#f2f2f2', 1),
        },
        background: {
          fill: {
            default: withOpacity('#0b8a1b', 1),
            hovered: withOpacity('#006622', 1),
            pressed: withOpacity('#003d1e', 1),
            disabled: withOpacity('#c0c0c0', 1),
          },
          border: {
            default: withOpacity('#000000', 0),
            hovered: withOpacity('#000000', 0),
            pressed: withOpacity('#000000', 0),
          },
        },
        subtext: {
          default: withOpacity('#ffffff', 0.7),
          hovered: withOpacity('#ffffff', 0.7),
          pressed: withOpacity('#ffffff', 0.7),
          disabled: withOpacity('#f2f2f2', 1),
        },
      },
      negative: {
        label: {
          default: withOpacity('#ffffff', 0.9),
          hovered: withOpacity('#ffffff', 0.9),
          pressed: withOpacity('#ffffff', 0.9),
          disabled: withOpacity('#f2f2f2', 1),
        },
        icon: {
          default: withOpacity('#ffffff', 0.9),
          hovered: withOpacity('#ffffff', 0.9),
          pressed: withOpacity('#ffffff', 0.9),
          disabled: withOpacity('#f2f2f2', 1),
        },
        background: {
          fill: {
            default: withOpacity('#dd1535', 1),
            hovered: withOpacity('#aa0a1e', 1),
            pressed: withOpacity('#6d020a', 1),
            disabled: withOpacity('#c0c0c0', 1),
          },
          border: {
            default: withOpacity('#000000', 0),
            hovered: withOpacity('#000000', 0),
            pressed: withOpacity('#000000', 0),
          },
        },
        subtext: {
          default: withOpacity('#ffffff', 0.7),
          hovered: withOpacity('#ffffff', 0.7),
          pressed: withOpacity('#ffffff', 0.7),
          disabled: withOpacity('#f2f2f2', 1),
        },
      },
    },
    selectionDropdown: {
      label: {
        default: withOpacity('#272727', 1),
        hovered: withOpacity('#272727', 1),
        pressed: withOpacity('#272727', 1),
        selected: withOpacity('#ffffff', 0.9),
      },
      icon: {
        default: withOpacity('#272727', 1),
        hovered: withOpacity('#272727', 1),
        pressed: withOpacity('#272727', 1),
        selected: withOpacity('#ffffff', 0.9),
        ring: {
          stop1: withOpacity('#014ed0', 1),
          stop2: withOpacity('#31d3f3', 1),
        },
      },
      background: {
        fill: {
          default: withOpacity('#ffffff', 0),
          hovered: withOpacity('#272727', 0.1),
          pressed: withOpacity('#272727', 0.2),
          selected: withOpacity('#272727', 0.9),
        },
        border: {
          default: withOpacity('#ffffff', 0),
          hovered: withOpacity('#ffffff', 0),
          pressed: withOpacity('#ffffff', 0),
          selected: withOpacity('#ffffff', 0),
        },
      },
    },
    iconIndicator: {
      icon: {
        good: withOpacity('#ffffff', 0),
        poor: withOpacity('#ffffff', 0),
        bad: withOpacity('#ffffff', 0),
        none: withOpacity('#ffffff', 0),
      },
      background: {
        fill: {
          good: withOpacity('#0b8a1b', 1),
          poor: withOpacity('#a94302', 1),
          bad: withOpacity('#dd1535', 1),
          none: withOpacity('#272727', 1),
        },
      },
    },
    toggle: {
      background: {
        default: withOpacity('#272727', 0.35),
        hovered: withOpacity('#272727', 0.45),
        pressed: withOpacity('#272727', 0.55),
        selected: withOpacity('#272727', 0.9),
      },
      handle: {
        default: withOpacity('#ffffff', 0.9),
        hovered: withOpacity('#ffffff', 0.95),
        pressed: withOpacity('#ffffff', 1),
        selected: withOpacity('#ffffff', 1),
      },
    },
    checkbox: {
      selected: {
        background: {
          default: withOpacity('#272727', 0.35),
          hover: withOpacity('#272727', 0.45),
          pressed: withOpacity('#272727', 0.55),
          selected: withOpacity('#272727', 0.9),
        },
        icon: {
          default: withOpacity('#ffffff', 0),
          hover: withOpacity('#ffffff', 0),
          pressed: withOpacity('#ffffff', 0),
          selected: withOpacity('#ffffff', 0.9),
        },
      },
    },
    radioButtons: {
      background: {
        default: withOpacity('#272727', 0.35),
        hovered: withOpacity('#272727', 0.45),
        pressed: withOpacity('#272727', 0.55),
        selected: withOpacity('#272727', 0.9),
      },
      icon: {
        default: withOpacity('#ffffff', 0),
        hovered: withOpacity('#ffffff', 0),
        pressed: withOpacity('#ffffff', 0),
        selected: withOpacity('#ffffff', 0.9),
      },
    },
    progressBar: {
      indeterminate: {
        background: {
          background: withOpacity('#272727', 0.1),
        },
        fill: {
          stop1: withOpacity('#272727', 1),
          stop2: withOpacity('#5a5a5a', 1),
          stop3: withOpacity('#272727', 1),
        },
      },
      determinate: {
        fill: {
          fill: withOpacity('#272727', 1),
        },
        background: {
          background: withOpacity('#272727', 0.1),
        },
      },
      quickReplies: {
        label: {
          default: withOpacity('#272727', 0.7),
          hovered: withOpacity('#272727', 0.7),
          pressed: withOpacity('#272727', 0.7),
          selected: withOpacity('#ffffff', 0.9),
        },
        icon: {
          default: withOpacity('#272727', 0.7),
          hovered: withOpacity('#272727', 0.7),
          pressed: withOpacity('#272727', 0.7),
          selected: withOpacity('#ffffff', 0.9),
        },
        background: {
          fill: {
            default: withOpacity('#ffffff', 0),
            hovered: withOpacity('#272727', 0.1),
            pressed: withOpacity('#272727', 0.2),
            selected: withOpacity('#272727', 0.9),
          },
          border: {
            default: withOpacity('#ffffff', 0),
            hovered: withOpacity('#ffffff', 0),
            pressed: withOpacity('#ffffff', 0),
            selected: withOpacity('#ffffff', 0),
          },
        },
        dividers: withOpacity('#272727', 0.1),
      },
    },
    menu: {
      title: {
        default: withOpacity('#272727', 1),
        hovered: withOpacity('#272727', 1),
        pressed: withOpacity('#272727', 1),
        selected: withOpacity('#ffffff', 0.9),
      },
      icon: {
        default: withOpacity('#272727', 0.7),
        hovered: withOpacity('#272727', 0.7),
        pressed: withOpacity('#272727', 0.7),
        selected: withOpacity('#ffffff', 0.9),
      },
      background: {
        fill: {
          default: withOpacity('#ffffff', 0),
          hovered: withOpacity('#272727', 0.1),
          pressed: withOpacity('#272727', 0.2),
          selected: withOpacity('#272727', 0.9),
        },
      },
      sectionHeader: withOpacity('#272727', 1),
      subtitle: {
        default: withOpacity('#272727', 0.7),
        hovered: withOpacity('#272727', 0.7),
        pressed: withOpacity('#272727', 0.7),
        selected: withOpacity('#ffffff', 0.9),
      },
      toggle: {
        title: {
          default: withOpacity('#272727', 1),
          hovered: withOpacity('#272727', 1),
          pressed: withOpacity('#272727', 1),
          selected: withOpacity('#272727', 1),
        },
        background: {
          fill: {
            default: withOpacity('#ffffff', 0),
            hovered: withOpacity('#272727', 0),
            pressed: withOpacity('#272727', 0),
            selected: withOpacity('#272727', 0),
          },
        },
        icon: {
          default: withOpacity('#272727', 0.7),
          hovered: withOpacity('#272727', 0.7),
          pressed: withOpacity('#272727', 0.7),
          selected: withOpacity('#272727', 0.7),
        },
        subtitle: {
          default: withOpacity('#272727', 0.7),
          hovered: withOpacity('#272727', 0.7),
          pressed: withOpacity('#272727', 0.7),
          selected: withOpacity('#272727', 0.7),
        },
      },
      labelIcon: {
        label: {
          default: withOpacity('#272727', 0.7),
          hovered: withOpacity('#272727', 0.7),
          pressed: withOpacity('#272727', 0.7),
          selected: withOpacity('#ffffff', 0.9),
        },
        icon: {
          default: withOpacity('#272727', 0.7),
          hovered: withOpacity('#272727', 0.7),
          pressed: withOpacity('#272727', 0.7),
          selected: withOpacity('#ffffff', 0.9),
        },
      },
    },
    sideNavigation: {
      sideNavItem: {
        label: {
          default: withOpacity('#272727', 1),
          hovered: withOpacity('#272727', 1),
          pressed: withOpacity('#272727', 1),
          selected: withOpacity('#ffffff', 0.9),
        },
        icon: {
          default: withOpacity('#272727', 0.7),
          hovered: withOpacity('#272727', 0.7),
          pressed: withOpacity('#272727', 0.7),
          selected: withOpacity('#ffffff', 0.9),
        },
        background: {
          fill: {
            default: withOpacity('#ffffff', 0),
            hovered: withOpacity('#272727', 0.1),
            pressed: withOpacity('#272727', 0.2),
            selected: withOpacity('#272727', 1),
          },
          border: {
            default: withOpacity('#ffffff', 0),
            hovered: withOpacity('#ffffff', 0),
            pressed: withOpacity('#ffffff', 0),
            selected: withOpacity('#ffffff', 0),
          },
        },
      },
      label: {
        label: {
          default: withOpacity('#272727', 1),
          hovered: withOpacity('#272727', 1),
          pressed: withOpacity('#272727', 1),
          selected: withOpacity('#272727', 1),
        },
        icon: {
          default: withOpacity('#272727', 0.7),
          hovered: withOpacity('#272727', 0.7),
          pressed: withOpacity('#272727', 0.7),
          selected: withOpacity('#272727', 0.9),
        },
        background: {
          fill: {
            default: withOpacity('#ffffff', 0),
            hovered: withOpacity('#272727', 0.1),
            pressed: withOpacity('#272727', 0.2),
            selected: withOpacity('#272727', 0),
          },
          border: {
            default: withOpacity('#ffffff', 0),
            hovered: withOpacity('#ffffff', 0),
            pressed: withOpacity('#ffffff', 0),
            selected: withOpacity('#ffffff', 0),
          },
        },
      },
    },
    badges: {
      primary: {
        background: withOpacity('#272727', 1),
        label: withOpacity('#ffffff', 0.9),
        icon: withOpacity('#ffffff', 0.9),
      },
      secondary: {
        background: withOpacity('#ffffff', 0.9),
        label: withOpacity('#272727', 1),
        icon: withOpacity('#272727', 1),
      },
      positive: {
        background: withOpacity('#0b8a1b', 1),
        label: withOpacity('#ffffff', 0.9),
        icon: withOpacity('#ffffff', 0.9),
      },
      background: {
        background: withOpacity('#dd1535', 1),
        label: withOpacity('#ffffff', 0.9),
        icon: withOpacity('#ffffff', 0.9),
      },
    },
    imageCards: {
      background: {
        fill: {
          default: withOpacity('#272727', 0),
          hovered: withOpacity('#272727', 0.1),
          pressed: withOpacity('#272727', 0.2),
          selected: withOpacity('#272727', 0),
        },
        border: {
          default: withOpacity('#272727', 0),
          hovered: withOpacity('#272727', 0),
          pressed: withOpacity('#272727', 0),
          selected: withOpacity('#272727', 0),
        },
      },
      label: {
        primary: withOpacity('#272727', 1),
        secondary: withOpacity('#272727', 0.7),
        metadata: withOpacity('#272727', 0.7),
        rating: {
          primary: withOpacity('#272727', 1),
          secondary: withOpacity('#272727', 0.7),
        },
        price: {
          primary: withOpacity('#272727', 1),
          secondary: withOpacity('#272727', 0.7),
        },
      },
      icon: {
        primary: withOpacity('#272727', 1),
        secondary: withOpacity('#272727', 0.7),
      },
    },
    tiles: {
      label: {
        onMedia: {
          primary: withOpacity('#ffffff', 0.9),
          secondary: withOpacity('#ffffff', 0.7),
        },
        primary: withOpacity('#272727', 1),
        secondary: withOpacity('#272727', 0.7),
      },
      icon: {
        onMedia: {
          primary: withOpacity('#ffffff', 1),
        },
        primary: withOpacity('#272727', 1),
        secondary: withOpacity('#272727', 0.7),
      },
      eventHeader: {
        label: {
          primary: withOpacity('#ffffff', 0.9),
          month: withOpacity('#dd1535', 1),
          date: withOpacity('#272727', 1),
        },
        background: {
          primary: withOpacity('#000000', 0.6),
          date: withOpacity('#ffffff', 0.9),
        },
        notification: {
          indicator: withOpacity('#dd1535', 1),
        },
      },
      background: {
        primary: withOpacity('#272727', 0.05),
      },
      mediaThumbnail: {
        border: withOpacity('#272727', 0.1),
      },
      check: {
        background: withOpacity('#ffffff', 0.9),
        icon: withOpacity('#272727', 1),
      },
    },
    segmentedControl: {
      background: {
        default: withOpacity('#272727', 0),
        hovered: withOpacity('#272727', 0.1),
        pressed: withOpacity('#272727', 0.2),
        selected: withOpacity('#272727', 1),
      },
      icon: {
        default: withOpacity('#272727', 1),
        hovered: withOpacity('#272727', 1),
        pressed: withOpacity('#272727', 1),
        selected: withOpacity('#ffffff', 0.9),
      },
      label: {
        default: withOpacity('#272727', 1),
        hovered: withOpacity('#272727', 1),
        pressed: withOpacity('#272727', 1),
        selected: withOpacity('#ffffff', 0.9),
      },
      selected: {
        background: withOpacity('#272727', 0.05),
      },
    },
    progressRing: {
      background: {
        active: withOpacity('#272727', 1),
        inactive: withOpacity('#272727', 0.1),
      },
      icon: {
        fill: withOpacity('#272727', 1),
      },
    },
    avatar: {
      badge: {
        active: withOpacity('#0b8a1b', 1),
      },
      focusRing: {
        default: withOpacity('#272727', 0),
        hovered: withOpacity('#272727', 0.1),
        pressed: withOpacity('#272727', 0.2),
        selected: withOpacity('#272727', 0.9),
      },
    },
    facepile: {
      label: withOpacity('#272727', 1),
    },
    peopleCard: {
      label: {
        secondary: withOpacity('#272727', 0.7),
        primary: withOpacity('#272727', 1),
        tertiary: withOpacity('#272727', 0.7),
      },
      badge: {
        active: withOpacity('#0b8a1b', 1),
      },
    },
    onMediaCheckbox: {
      background: {
        default: withOpacity('#ffffff', 0),
        hovered: withOpacity('#ffffff', 0.1),
        pressed: withOpacity('#ffffff', 0.2),
        selected: withOpacity('#ffffff', 1),
      },
      icon: {
        default: withOpacity('#ffffff', 0.9),
        hovered: withOpacity('#ffffff', 0.9),
        pressed: withOpacity('#ffffff', 0.9),
        selected: withOpacity('#272727', 1),
      },
    },
    syncButton: {
      background: {
        default: withOpacity('#ffffff', 0),
        hovered: withOpacity('#ffffff', 0.1),
        pressed: withOpacity('#ffffff', 0),
      },
      icon: {
        default: withOpacity('#ffffff', 0.9),
        hovered: withOpacity('#ffffff', 0.9),
        pressed: withOpacity('#ffffff', 0.9),
      },
      progressRing: {
        background: withOpacity('#ffffff', 0.3),
        fill: withOpacity('#ffffff', 0.9),
      },
    },
    galleryTile: {
      icon: withOpacity('#ffffff', 1),
      label: withOpacity('#ffffff', 0.9),
    },
    search: {
      label: withOpacity('#272727', 0.7),
      cursor: withOpacity('#0173ec', 1),
      background: {
        default: withOpacity('#272727', 0.05),
        hovered: withOpacity('#272727', 0.1),
        pressed: withOpacity('#272727', 0.2),
        typing: withOpacity('#272727', 0.05),
      },
      icon: withOpacity('#272727', 1),
    },
    slider: {
      label: withOpacity('#272727', 0.7),
      background: withOpacity('#272727', 0.05),
      icon: withOpacity('#272727', 1),
      handle: {
        background: {
          hover: withOpacity('#ffffff', 0.1),
          pressed: withOpacity('#ffffff', 0.2),
          default: withOpacity('#ffffff', 0),
        },
        icon: withOpacity('#ffffff', 0.9),
        label: withOpacity('#ffffff', 0.9),
      },
      foreground: {
        default: withOpacity('#272727', 1),
      },
    },
    typehead: {
      icon: withOpacity('#272727', 0.7),
      label: withOpacity('#272727', 0.7),
      background: {
        default: withOpacity('#272727', 0),
        hovered: withOpacity('#272727', 0.1),
        pressed: withOpacity('#272727', 0.15),
      },
    },
    inputKeys: {
      letter: {
        background: {
          default: withOpacity('#272727', 0.05),
          pressed: withOpacity('#272727', 0.2),
          hovered: withOpacity('#272727', 0.1),
        },
        label: {
          primary: withOpacity('#272727', 1),
          secondary: withOpacity('#272727', 0.3),
        },
      },
      icon: {
        background: {
          default: withOpacity('#272727', 0.05),
          hovered: withOpacity('#272727', 0.1),
          pressed: withOpacity('#272727', 0.2),
        },
        icon: {
          default: withOpacity('#272727', 0.9),
          hovered: withOpacity('#272727', 0.9),
          pressed: withOpacity('#272727', 0.9),
        },
      },
      alt: {
        background: {
          default: withOpacity('#ffffff', 1),
          hovered: withOpacity('#272727', 0.1),
          pressed: withOpacity('#272727', 0.2),
        },
        label: {
          primary: withOpacity('#272727', 1),
          secondary: withOpacity('#272727', 0.3),
        },
      },
      primary: {
        background: {
          default: withOpacity('#272727', 1),
          hovered: withOpacity('#5a5a5a', 1),
          pressed: withOpacity('#747474', 1),
        },
        icon: {
          default: withOpacity('#ffffff', 0.9),
          hovered: withOpacity('#ffffff', 0.9),
          pressed: withOpacity('#ffffff', 0.9),
        },
      },
      spaceBar: {
        background: {
          default: withOpacity('#272727', 0.05),
          hovered: withOpacity('#272727', 0.1),
          pressed: withOpacity('#272727', 0.2),
        },
      },
    },
    controlBar: {
      background: {
        default: withOpacity('#ffffff', 1),
        spatialMinimized: {
          fill: withOpacity('#ffffff', 1),
          border: withOpacity('#ffffff', 1),
        },
      },
      label: withOpacity('#272727', 1),
    },
    inputKeyboard: {
      background: {
        fill: {
          stop1: withOpacity('#ffffff', 1),
          stop2: withOpacity('#f2f2f2', 1),
        },
        border: withOpacity('#272727', 0.1),
      },
      dividers: withOpacity('#272727', 0.1),
      label: withOpacity('#272727', 0.7),
    },
    tooltip: {
      background: {
        stop1: withOpacity('#ffffff', 1),
        stop2: withOpacity('#f2f2f2', 1),
      },
      icon: {
        default: withOpacity('#272727', 1),
      },
      label: {
        primary: withOpacity('#272727', 1),
        secondary: withOpacity('#272727', 0.7),
      },
    },
    infoCells: {
      background: withOpacity('#272727', 0.05),
      icon: withOpacity('#272727', 0.7),
      subheadline: withOpacity('#272727', 0.7),
      label: withOpacity('#272727', 0.7),
    },
    listCells: {
      background: {
        default: withOpacity('#272727', 0.05),
        hovered: withOpacity('#272727', 0.1),
        pressed: withOpacity('#272727', 0.2),
      },
      label: {
        primary: withOpacity('#272727', 1),
        secondary: withOpacity('#272727', 0.7),
        secondaryTextIcon: withOpacity('#272727', 0.7),
      },
      attribute: {
        primary: withOpacity('#272727', 1),
      },
    },
    auiNavigationBar: {
      background: {
        stop1: withOpacity('#ffffff', 1),
        stop2: withOpacity('#f2f2f2', 1),
      },
      statusElements: {
        time: withOpacity('#272727', 0.7),
        wifi: withOpacity('#272727', 1),
        battery: withOpacity('#272727', 1),
      },
      divider: withOpacity('#272727', 0.1),
    },
    achievementRow: {
      background: {
        default: withOpacity('#272727', 0),
      },
      label: {
        primary: withOpacity('#272727', 1),
        rating: withOpacity('#272727', 0.7),
        category: withOpacity('#272727', 0.7),
        description: withOpacity('#272727', 0.7),
        achievements: withOpacity('#272727', 0.7),
        progress: withOpacity('#272727', 1),
      },
      icon: {
        rating: withOpacity('#272727', 1),
      },
    },
    browserTab: {
      background: {
        default: withOpacity('#272727', 0),
        hovered: withOpacity('#272727', 0.1),
        pressed: withOpacity('#272727', 0.2),
        selected: withOpacity('#272727', 0.9),
      },
      label: {
        default: withOpacity('#272727', 1),
        hovered: withOpacity('#272727', 1),
        pressed: withOpacity('#272727', 1),
        selected: withOpacity('#ffffff', 0.9),
      },
    },
    browserToolBar: {
      icon: withOpacity('#272727', 0.7),
    },
    browserTopBar: {
      label: {
        primary: withOpacity('#272727', 1),
        secondary: withOpacity('#272727', 0.7),
      },
      icon: {
        primary: withOpacity('#272727', 1),
        secondary: withOpacity('#272727', 0.7),
      },
    },
    dialogModals: {
      background: {
        stop1: withOpacity('#ffffff', 1),
        stop2: withOpacity('#f2f2f2', 1),
      },
      label: {
        primary: withOpacity('#272727', 1),
        secondary: withOpacity('#272727', 0.7),
        link: withOpacity('#0173ec', 1),
      },
      icon: {
        primary: withOpacity('#272727', 1),
      },
    },
    fullPanelModals: {
      background: {
        stop1: withOpacity('#ffffff', 1),
        stop2: withOpacity('#f2f2f2', 1),
      },
      label: {
        primary: withOpacity('#272727', 1),
        secondary: withOpacity('#272727', 0.7),
      },
    },
    heroImage: {
      label: {
        primary: withOpacity('#ffffff', 0.9),
        secondary: withOpacity('#ffffff', 0.7),
      },
      pagination: {
        active: withOpacity('#ffffff', 0.9),
        inactive: withOpacity('#ffffff', 0.3),
      },
    },
    listHeader: {
      label: {
        primary: withOpacity('#272727', 1),
        secondary: withOpacity('#272727', 0.7),
      },
    },
    mediaControls: {
      icon: {
        icon: withOpacity('#ffffff', 0.9),
        progressBar: {
          foreground: withOpacity('#ffffff', 0.9),
          background: withOpacity('#ffffff', 0.3),
        },
      },
      playButton: {
        background: withOpacity('#ffffff', 0.9),
        icon: withOpacity('#272727', 1),
      },
    },
    inputField: {
      label: withOpacity('#272727', 0.7),
      icon: withOpacity('#272727', 0.7),
      inputField: withOpacity('#272727', 0.05),
      background: {
        default: withOpacity('#272727', 0.05),
        hovered: withOpacity('#272727', 0.1),
        pressed: withOpacity('#272727', 0.2),
      },
    },
    popover: {
      label: {
        primary: withOpacity('#272727', 1),
        secondary: withOpacity('#272727', 0.7),
      },
      background: {
        stop1: withOpacity('#ffffff', 1),
        stop2: withOpacity('#f2f2f2', 1),
      },
      icon: withOpacity('#272727', 1),
    },
    sectionHeader: {
      label: {
        primary: withOpacity('#272727', 1),
        secondary: withOpacity('#272727', 0.7),
      },
    },
    scrollbars: {
      background: {
        fill: withOpacity('#272727', 1),
      },
    },
    bottomButton: {
      label: {
        primary: withOpacity('#272727', 0.7),
        link: withOpacity('#0173ec', 1),
      },
    },
    sidesheet: {
      background: {
        stop1: withOpacity('#ffffff', 1),
        stop2: withOpacity('#f2f2f2', 1),
      },
      label: {
        primary: withOpacity('#272727', 1),
        secondary: withOpacity('#272727', 0.7),
      },
      divider: withOpacity('#272727', 0.1),
    },
    toast: {
      toast: {
        background: {
          stop1: withOpacity('#ffffff', 1),
          stop2: withOpacity('#f2f2f2', 1),
          delete: withOpacity('#dd1535', 1),
          label: {
            primary: withOpacity('#272727', 1),
            secondary: withOpacity('#272727', 0.7),
          },
          icon: {
            primary: withOpacity('#272727', 1),
          },
        },
        slider: {
          background: withOpacity('#272727', 0.1),
          forground: withOpacity('#272727', 1),
        },
      },
    },
    reactionPill: {
      background: {
        border: {
          stop1: withOpacity('#ffffff', 1),
          stop2: withOpacity('#f2f2f2', 1),
        },
        fill: withOpacity('#f2f2f2', 1),
      },
      label: withOpacity('#272727', 1),
    },
    chatBubble: {
      sender: {
        fill: withOpacity('#272727', 1),
        label: withOpacity('#ffffff', 1),
      },
      responder: {
        fill: withOpacity('#f2f2f2', 1),
        label: withOpacity('#272727', 1),
      },
    },
    avatarTile: {
      background: withOpacity('#272727', 0.05),
      selectedBorder: withOpacity('#272727', 1),
      label: {
        primary: withOpacity('#272727', 1),
        secondary: withOpacity('#272727', 0.7),
      },
      multiselect: {
        background: withOpacity('#272727', 1),
        icon: withOpacity('#f2f2f2', 1),
        border: withOpacity('#ffffff', 1),
      },
      icon: withOpacity('#272727', 1),
      reward: {
        background: withOpacity('#000000', 0.05),
        gradient: withOpacity('#6441d2', 1),
        label: {
          primary: withOpacity('#272727', 1),
          secondary: withOpacity('#272727', 0.7),
        },
        slider: {
          background: withOpacity('#e2e4ea', 1),
          foreground: withOpacity('#6441d2', 1),
        },
        icon: withOpacity('#272727', 0.7),
      },
    },
    avatarSideNav: {
      background: {
        default: withOpacity('#272727', 0),
        hovered: withOpacity('#272727', 0.1),
        selected: withOpacity('#272727', 0.9),
      },
      icon: {
        default: withOpacity('#272727', 1),
        hovered: withOpacity('#272727', 1),
        selected: withOpacity('#ffffff', 0.9),
      },
      attribute: {
        default: withOpacity('#272727', 1),
        hovered: withOpacity('#272727', 1),
        selected: withOpacity('#ffffff', 0.9),
      },
      label: {
        default: withOpacity('#272727', 1),
        hovered: withOpacity('#272727', 1),
        selected: withOpacity('#ffffff', 0.9),
      },
    },
    avatarLoader: {
      fill: withOpacity('#272727', 1),
      background: withOpacity('#272727', 0.1),
    },
    avatarColorPickerSwatch: {
      selectedState: withOpacity('#272727', 1),
      icon: withOpacity('#ffffff', 0.9),
      noneBackground: withOpacity('#272727', 1),
    },
    avatarSlider: {
      label: withOpacity('#272727', 1),
      icon: withOpacity('#272727', 0.7),
      slider: {
        background: withOpacity('#272727', 0.05),
        label: withOpacity('#272727', 0.7),
        icon: withOpacity('#272727', 1),
        foreground: {
          default: withOpacity('#272727', 0.9),
        },
        handle: {
          icon: withOpacity('#ffffff', 0.9),
          label: withOpacity('#ffffff', 0.9),
        },
      },
      background: withOpacity('#272727', 0.05),
    },
    avatarSectionHeader: {
      label: {
        primary: withOpacity('#272727', 1),
        secondary: withOpacity('#272727', 0.7),
      },
      icon: withOpacity('#272727', 1),
    },
    avatarSegmentedControl: {
      background: {
        chips: {
          default: withOpacity('#272727', 0),
          hovered: withOpacity('#272727', 0.1),
          pressed: withOpacity('#272727', 0.2),
          selected: withOpacity('#272727', 0.9),
        },
        picker: {
          default: withOpacity('#272727', 0.05),
        },
      },
      icon: {
        default: withOpacity('#272727', 0.7),
        hovered: withOpacity('#272727', 0.85),
        pressed: withOpacity('#272727', 0.9),
        selected: withOpacity('#ffffff', 0.9),
      },
      label: {
        default: withOpacity('#272727', 0.7),
        hovered: withOpacity('#272727', 0.7),
        pressed: withOpacity('#272727', 0.7),
        selected: withOpacity('#ffffff', 0.9),
      },
      selected: {
        background: withOpacity('#272727', 0.05),
      },
    },
    emptyStateIllustration: {
      icon: {
        primary: withOpacity('#272727', 0.5),
        secondary: withOpacity('#272727', 0.9),
      },
      abstractStars: withOpacity('#272727', 0.15),
      shimmer: withOpacity('#272727', 0.08),
    },
    navigationOverflowMenu: {
      label: {
        default: withOpacity('#272727', 1),
        hovered: withOpacity('#272727', 1),
        pressed: withOpacity('#272727', 1),
        selected: withOpacity('#ffffff', 0.9),
        disabled: withOpacity('#272727', 0.3),
      },
      icon: {
        default: withOpacity('#272727', 0.7),
        hovered: withOpacity('#272727', 0.7),
        pressed: withOpacity('#272727', 0.7),
        selected: withOpacity('#ffffff', 0.9),
        disabled: withOpacity('#272727', 0.3),
      },
      background: {
        fill: {
          default: withOpacity('#ffffff', 0),
          hovered: withOpacity('#272727', 0.1),
          pressed: withOpacity('#272727', 0.2),
          selected: withOpacity('#272727', 0.9),
          disabled: withOpacity('#ffffff', 0),
        },
        border: {
          default: withOpacity('#ffffff', 0),
          hovered: withOpacity('#ffffff', 0),
          pressed: withOpacity('#ffffff', 0),
          selected: withOpacity('#ffffff', 0),
        },
      },
    },
    navigationSystemBar: {
      elementsButton: {
        icon: {
          default: withOpacity('#ffffff', 1),
          hover: withOpacity('#ffffff', 1),
          pressed: withOpacity('#ffffff', 1),
          active: withOpacity('#ffffff', 1),
          green: withOpacity('#ffffff', 1),
          blue: withOpacity('#ffffff', 1),
          withBadge: withOpacity('#ffffff', 1),
          withStatus: withOpacity('#ffffff', 1),
          privacyOn: withOpacity('#ffffff', 1),
          open: withOpacity('#ffffff', 1),
          recording: withOpacity('#ffffff', 1),
        },
        fill: {
          default: withOpacity('#ffffff', 1),
          hover: withOpacity('#ffffff', 1),
          pressed: withOpacity('#ffffff', 1),
          active: withOpacity('#ffffff', 1),
          withBadge: withOpacity('#ffffff', 1),
          withStatus: withOpacity('#ffffff', 1),
          privacyOn: withOpacity('#ffffff', 1),
          open: withOpacity('#ffffff', 1),
          recording: withOpacity('#ffffff', 1),
          number: withOpacity('#ffffff', 1),
          status: withOpacity('#ffffff', 1),
        },
        green: {
          stop1: withOpacity('#ffffff', 1),
          stop2: withOpacity('#ffffff', 1),
          stop3: withOpacity('#ffffff', 1),
        },
        blue: {
          stop1: withOpacity('#ffffff', 1),
          stop2: withOpacity('#ffffff', 1),
          stop3: withOpacity('#ffffff', 1),
        },
        number: {
          label: withOpacity('#ffffff', 1),
        },
        badge: {
          fill: {
            privacyOn: withOpacity('#ffffff', 1),
            open: withOpacity('#ffffff', 1),
            recording: withOpacity('#ffffff', 1),
          },
        },
        background: {
          default: withOpacity('#ffffff', 1),
          hover: withOpacity('#ffffff', 1),
          pressed: withOpacity('#ffffff', 1),
          active: withOpacity('#ffffff', 1),
        },
      },
      personalDisplayBar: {
        chin: withOpacity('#ffffff', 1),
        defaultElementsButton: withOpacity('#ffffff', 1),
      },
      navigationChevron: {
        chevron: withOpacity('#ffffff', 1),
        fill: {
          default: withOpacity('#ffffff', 1),
          hover: withOpacity('#ffffff', 1),
        },
      },
      dividers: withOpacity('#ffffff', 1),
      time: withOpacity('#ffffff', 1),
      worldPillButton: {
        background: {
          default: withOpacity('#ffffff', 1),
        },
      },
      appPillButton: {
        background: {
          default: withOpacity('#ffffff', 1),
        },
      },
      avatarPillButton: {
        background: {
          default: withOpacity('#ffffff', 1),
          hover: withOpacity('#ffffff', 1),
        },
      },
      homeIcon: {
        background: {
          default: withOpacity('#ffffff', 1),
          hover: withOpacity('#ffffff', 1),
        },
        icon: withOpacity('#ffffff', 1),
      },
      sectionHeader: withOpacity('#000000', 1),
    },
    textInput: {
      label: {
        default: withOpacity('#272727', 0.7),
        hover: withOpacity('#272727', 0.7),
        pressed: withOpacity('#272727', 0.7),
        typing: withOpacity('#272727', 1),
      },
      cursor: withOpacity('#0173ec', 1),
      icon: withOpacity('#272727', 0.7),
      background: {
        default: withOpacity('#272727', 0.05),
        hovered: withOpacity('#272727', 0.1),
        pressed: withOpacity('#272727', 0.2),
        typing: withOpacity('#272727', 0.05),
      },
    },
    navigationAppTile: {
      label: {
        primary: withOpacity('#ffffff', 1),
        secondary: withOpacity('#ffffff', 1),
      },
      attribute: withOpacity('#ffffff', 1),
      activeIndicator: withOpacity('#ffffff', 1),
      navigationUninstalledStates: {
        label: withOpacity('#ffffff', 1),
        iconButton: {
          download: {
            fill: withOpacity('#ffffff', 1),
            icon: withOpacity('#ffffff', 1),
          },
          queued: {
            stroke: withOpacity('#ffffff', 1),
          },
          queuedHover: {
            icon: withOpacity('#ffffff', 1),
            fill: withOpacity('#ffffff', 1),
          },
          cancel: {
            icon: withOpacity('#ffffff', 1),
            fill: withOpacity('#ffffff', 1),
          },
          downloadingProgress: {
            stroke: {
              inactiveStroke: withOpacity('#ffffff', 1),
              activeStroke: withOpacity('#ffffff', 1),
            },
          },
          installing: {
            stroke: {
              activeStroke: withOpacity('#ffffff', 1),
            },
          },
          redeem: {
            icon: withOpacity('#ffffff', 1),
            fill: withOpacity('#ffffff', 1),
          },
          view: {
            icon: withOpacity('#ffffff', 1),
            fill: withOpacity('#ffffff', 1),
          },
          update: {
            icon: withOpacity('#ffffff', 1),
            fill: withOpacity('#ffffff', 1),
          },
        },
      },
      uninstalledScrim: withOpacity('#ffffff', 1),
    },
    semantic: {
      ui: {
        focusring: {
          default: withOpacity('#272727', 0),
          hovered: withOpacity('#272727', 0.1),
          pressed: withOpacity('#272727', 0.2),
          selected: withOpacity('#272727', 0.9),
        },
        primary: {
          text: withOpacity('#ffffff', 0.9),
          icon: withOpacity('#ffffff', 0.9),
          background: {
            default: withOpacity('#272727', 1),
            hovered: withOpacity('#5a5a5a', 1),
            pressed: withOpacity('#747474', 1),
          },
        },
        secondary: {
          text: withOpacity('#272727', 1),
          icon: withOpacity('#272727', 1),
          background: {
            default: withOpacity('#272727', 0.05),
            hovered: withOpacity('#272727', 0.1),
            pressed: withOpacity('#272727', 0.2),
          },
        },
        tertiary: {
          text: withOpacity('#272727', 1),
          icon: withOpacity('#272727', 1),
          background: {
            default: withOpacity('#272727', 0),
            hovered: withOpacity('#272727', 0.1),
            pressed: withOpacity('#272727', 0.15),
          },
        },
        disabled: {
          text: withOpacity('#f2f2f2', 1),
          icon: withOpacity('#f2f2f2', 1),
          background: {
            default: withOpacity('#c0c0c0', 1),
            hovered: withOpacity('#c0c0c0', 1),
            pressed: withOpacity('#c0c0c0', 1),
          },
        },
        selected: {
          text: withOpacity('#f2f2f2', 1),
          icon: withOpacity('#f2f2f2', 1),
          background: {
            default: withOpacity('#272727', 1),
            hovered: withOpacity('#000000', 0.9),
            pressed: withOpacity('#000000', 0.95),
          },
        },
        deselected: {
          text: withOpacity('#272727', 1),
          icon: withOpacity('#272727', 1),
          background: {
            default: withOpacity('#272727', 0.05),
            hovered: withOpacity('#272727', 0.1),
            pressed: withOpacity('#272727', 0.15),
          },
        },
        onMedia: {
          text: withOpacity('#f2f2f2', 1),
          icon: withOpacity('#f2f2f2', 1),
          background: {
            default: withOpacity('#ffffff', 0),
            hovered: withOpacity('#ffffff', 0.1),
            pressed: withOpacity('#ffffff', 0.2),
          },
        },
      },
      status: {
        notification: withOpacity('#0173ec', 1),
        hidden: withOpacity('#8e8e8e', 1),
        positive: withOpacity('#0b8a1b', 1),
        negative: withOpacity('#dd1535', 1),
        warning: withOpacity('#a94302', 1),
        privacy: withOpacity('#6441d2', 1),
      },
      text: {
        primary: withOpacity('#272727', 1),
        secondary: withOpacity('#272727', 0.7),
        placeholder: withOpacity('#272727', 0.3),
        disabled: withOpacity('#272727', 0.3),
        link: withOpacity('#0173ec', 1),
        positive: withOpacity('#0b8a1b', 1),
        negative: withOpacity('#dd1535', 1),
        warning: withOpacity('#a94302', 1),
        primaryOnMedia: withOpacity('#ffffff', 0.9),
        secondaryOnMedia: withOpacity('#ffffff', 0.7),
      },
      icon: {
        primary: withOpacity('#272727', 1),
        secondary: withOpacity('#272727', 0.7),
        placeholder: withOpacity('#272727', 0.3),
        disabled: withOpacity('#272727', 0.3),
        positive: withOpacity('#0b8a1b', 1),
        negative: withOpacity('#dd1535', 1),
        warning: withOpacity('#a94302', 1),
        onMedia: withOpacity('#ffffff', 0.9),
        secondaryOnMedia: withOpacity('#ffffff', 0.7),
      },
      background: {
        primary: {
          stop1: withOpacity('#ffffff', 1),
          stop2: withOpacity('#f2f2f2', 1),
        },
        positive: withOpacity('#0b8a1b', 1),
        negative: withOpacity('#dd1535', 1),
        privacy: withOpacity('#6441d2', 1),
        ui: {
          primary: withOpacity('#272727', 1),
          secondary: withOpacity('#272727', 0.05),
        },
      },
      shadows: {
        punchedIn: {
          dropShadow: withOpacity('#ffffff', 1),
          innerShadow: withOpacity('#272727', 0.05),
        },
        beveled: {
          left: withOpacity('#ffffff', 1),
          right: withOpacity('#272727', 0.05),
        },
        dropShadow: {
          innerShadow: {
            left: withOpacity('#ffffff', 1),
            right: withOpacity('#272727', 0.05),
          },
          dropShadow: {
            top: withOpacity('#272727', 0.05),
            bottom: withOpacity('#272727', 0.05),
          },
        },
        panel: {
          innerShadow: withOpacity('#272727', 0.1),
          innerShadow2: withOpacity('#ffffff', 1),
        },
      },
    },
  },
} as const

const darkTheme = {
  component: {
    button: {
      primary: {
        background: {
          fill: {
            default: withOpacity('#ffffff', 0.9),
            hovered: withOpacity('#d9d9d9', 1),
            pressed: withOpacity('#c0c0c0', 1),
            disabled: withOpacity('#5a5a5a', 1),
          },
          border: {
            default: withOpacity('#000000', 0),
            hovered: withOpacity('#000000', 0),
            pressed: withOpacity('#000000', 0),
          },
        },
        label: {
          default: withOpacity('#272727', 1),
          hovered: withOpacity('#272727', 1),
          pressed: withOpacity('#272727', 1),
          disabled: withOpacity('#ffffff', 0.3),
        },
        icon: {
          default: withOpacity('#272727', 1),
          hovered: withOpacity('#272727', 1),
          pressed: withOpacity('#272727', 1),
          disabled: withOpacity('#f2f2f2', 1),
        },
        subtext: {
          default: withOpacity('#272727', 0.7),
          hovered: withOpacity('#272727', 0.7),
          pressed: withOpacity('#272727', 0.7),
          disabled: withOpacity('#ffffff', 0.3),
        },
      },
      secondary: {
        label: {
          default: withOpacity('#ffffff', 0.9),
          hovered: withOpacity('#ffffff', 0.9),
          pressed: withOpacity('#ffffff', 0.9),
          disabled: withOpacity('#ffffff', 0.3),
        },
        icon: {
          default: withOpacity('#ffffff', 0.9),
          hovered: withOpacity('#ffffff', 0.9),
          pressed: withOpacity('#ffffff', 0.9),
          disabled: withOpacity('#ffffff', 0.3),
        },
        background: {
          fill: {
            default: withOpacity('#ffffff', 0.05),
            hovered: withOpacity('#ffffff', 0.1),
            pressed: withOpacity('#ffffff', 0.2),
            disabled: withOpacity('#ffffff', 0.05),
          },
          border: {
            default: withOpacity('#000000', 0),
            hovered: withOpacity('#000000', 0),
            pressed: withOpacity('#000000', 0),
          },
        },
        subtext: {
          default: withOpacity('#ffffff', 0.7),
          hovered: withOpacity('#ffffff', 0.7),
          pressed: withOpacity('#ffffff', 0.7),
          disabled: withOpacity('#ffffff', 0.7),
        },
      },
      tertiary: {
        label: {
          default: withOpacity('#ffffff', 0.9),
          hovered: withOpacity('#ffffff', 0.9),
          pressed: withOpacity('#ffffff', 0.9),
          disabled: withOpacity('#ffffff', 0.3),
        },
        icon: {
          default: withOpacity('#ffffff', 0.9),
          hovered: withOpacity('#ffffff', 0.9),
          pressed: withOpacity('#ffffff', 0.9),
          disabled: withOpacity('#ffffff', 0.3),
        },
        background: {
          fill: {
            default: withOpacity('#ffffff', 0),
            hovered: withOpacity('#ffffff', 0.1),
            pressed: withOpacity('#ffffff', 0.15),
            disabled: withOpacity('#ffffff', 0),
          },
          border: {
            default: withOpacity('#000000', 0),
            hovered: withOpacity('#000000', 0),
            pressed: withOpacity('#000000', 0),
          },
        },
        subtext: {
          default: withOpacity('#ffffff', 0.7),
          hovered: withOpacity('#ffffff', 0.7),
          pressed: withOpacity('#ffffff', 0.7),
          disabled: withOpacity('#ffffff', 0.7),
        },
      },
      onMedia: {
        label: {
          default: withOpacity('#ffffff', 0.9),
          hovered: withOpacity('#ffffff', 0.9),
          pressed: withOpacity('#ffffff', 0.9),
          disabled: withOpacity('#ffffff', 0.35),
        },
        icon: {
          default: withOpacity('#ffffff', 0.9),
          hovered: withOpacity('#ffffff', 0.9),
          pressed: withOpacity('#ffffff', 0.9),
          disabled: withOpacity('#ffffff', 0.35),
        },
        background: {
          fill: {
            default: withOpacity('#ffffff', 0),
            hovered: withOpacity('#ffffff', 0.1),
            pressed: withOpacity('#ffffff', 0.2),
            disabled: withOpacity('#ffffff', 0),
          },
          border: {
            default: withOpacity('#000000', 0),
            hovered: withOpacity('#000000', 0),
            pressed: withOpacity('#000000', 0),
          },
        },
        subtext: {
          default: withOpacity('#ffffff', 0.9),
          hovered: withOpacity('#ffffff', 0.9),
          pressed: withOpacity('#ffffff', 0.9),
          disabled: withOpacity('#ffffff', 0.35),
        },
      },
      positive: {
        label: {
          default: withOpacity('#ffffff', 1),
          hovered: withOpacity('#ffffff', 1),
          pressed: withOpacity('#ffffff', 1),
          disabled: withOpacity('#f2f2f2', 1),
        },
        icon: {
          default: withOpacity('#ffffff', 1),
          hovered: withOpacity('#ffffff', 1),
          pressed: withOpacity('#ffffff', 1),
          disabled: withOpacity('#f2f2f2', 1),
        },
        background: {
          fill: {
            default: withOpacity('#2ad116', 1),
            hovered: withOpacity('#006622', 1),
            pressed: withOpacity('#003d1e', 1),
            disabled: withOpacity('#5a5a5a', 1),
          },
          border: {
            default: withOpacity('#000000', 0),
            hovered: withOpacity('#000000', 0),
            pressed: withOpacity('#000000', 0),
          },
        },
        subtext: {
          default: withOpacity('#ffffff', 0.9),
          hovered: withOpacity('#ffffff', 0.9),
          pressed: withOpacity('#ffffff', 0.9),
          disabled: withOpacity('#f2f2f2', 1),
        },
      },
      negative: {
        label: {
          default: withOpacity('#ffffff', 1),
          hovered: withOpacity('#ffffff', 1),
          pressed: withOpacity('#ffffff', 1),
          disabled: withOpacity('#f2f2f2', 1),
        },
        icon: {
          default: withOpacity('#ffffff', 1),
          hovered: withOpacity('#ffffff', 1),
          pressed: withOpacity('#ffffff', 1),
          disabled: withOpacity('#f2f2f2', 1),
        },
        background: {
          fill: {
            default: withOpacity('#f7818c', 1),
            hovered: withOpacity('#f45b6b', 1),
            pressed: withOpacity('#ec374e', 1),
            disabled: withOpacity('#5a5a5a', 1),
          },
          border: {
            default: withOpacity('#000000', 0),
            hovered: withOpacity('#000000', 0),
            pressed: withOpacity('#000000', 0),
          },
        },
        subtext: {
          default: withOpacity('#ffffff', 0.9),
          hovered: withOpacity('#ffffff', 0.9),
          pressed: withOpacity('#ffffff', 0.9),
          disabled: withOpacity('#f2f2f2', 1),
        },
      },
    },
    selectionDropdown: {
      label: {
        default: withOpacity('#ffffff', 0.9),
        hovered: withOpacity('#ffffff', 0.9),
        pressed: withOpacity('#ffffff', 0.9),
        selected: withOpacity('#272727', 1),
      },
      icon: {
        default: withOpacity('#ffffff', 0.9),
        hovered: withOpacity('#ffffff', 0.9),
        pressed: withOpacity('#ffffff', 0.9),
        selected: withOpacity('#272727', 1),
        ring: {
          stop1: withOpacity('#014ed0', 1),
          stop2: withOpacity('#31d3f3', 1),
        },
      },
      background: {
        fill: {
          default: withOpacity('#ffffff', 0),
          hovered: withOpacity('#ffffff', 0.1),
          pressed: withOpacity('#ffffff', 0.2),
          selected: withOpacity('#ffffff', 0.9),
        },
        border: {
          default: withOpacity('#000000', 0),
          hovered: withOpacity('#000000', 0),
          pressed: withOpacity('#000000', 0),
          selected: withOpacity('#000000', 0),
        },
      },
    },
    iconIndicator: {
      icon: {
        good: withOpacity('#000000', 0),
        poor: withOpacity('#000000', 0),
        bad: withOpacity('#000000', 0),
        none: withOpacity('#000000', 0),
      },
      background: {
        fill: {
          good: withOpacity('#2ad116', 1),
          poor: withOpacity('#fc9435', 1),
          bad: withOpacity('#f7818c', 1),
          none: withOpacity('#ffffff', 0.9),
        },
      },
    },
    toggle: {
      background: {
        default: withOpacity('#ffffff', 0.15),
        hovered: withOpacity('#ffffff', 0.25),
        pressed: withOpacity('#ffffff', 0.35),
        selected: withOpacity('#000000', 1),
      },
      handle: {
        default: withOpacity('#ffffff', 0.9),
        hovered: withOpacity('#ffffff', 0.95),
        pressed: withOpacity('#ffffff', 1),
        selected: withOpacity('#ffffff', 1),
      },
    },
    checkbox: {
      selected: {
        background: {
          default: withOpacity('#ffffff', 0.15),
          hover: withOpacity('#ffffff', 0.25),
          pressed: withOpacity('#ffffff', 0.35),
          selected: withOpacity('#ffffff', 1),
        },
        icon: {
          default: withOpacity('#272727', 0),
          hover: withOpacity('#272727', 0),
          pressed: withOpacity('#272727', 0),
          selected: withOpacity('#272727', 0.9),
        },
      },
    },
    radioButtons: {
      background: {
        default: withOpacity('#ffffff', 0.15),
        hovered: withOpacity('#ffffff', 0.25),
        pressed: withOpacity('#ffffff', 0.35),
        selected: withOpacity('#ffffff', 1),
      },
      icon: {
        default: withOpacity('#272727', 0),
        hovered: withOpacity('#272727', 0),
        pressed: withOpacity('#272727', 0),
        selected: withOpacity('#272727', 0.9),
      },
    },
    progressBar: {
      indeterminate: {
        background: {
          background: withOpacity('#000000', 0.1),
        },
        fill: {
          stop1: withOpacity('#ffffff', 0.7),
          stop2: withOpacity('#ffffff', 0.9),
          stop3: withOpacity('#ffffff', 0.7),
        },
      },
      determinate: {
        fill: {
          fill: withOpacity('#ffffff', 0.9),
        },
        background: {
          background: withOpacity('#000000', 0.1),
        },
      },
      quickReplies: {
        label: {
          default: withOpacity('#ffffff', 0.7),
          hovered: withOpacity('#ffffff', 0.7),
          pressed: withOpacity('#ffffff', 0.7),
          selected: withOpacity('#272727', 0.9),
        },
        icon: {
          default: withOpacity('#ffffff', 0.9),
          hovered: withOpacity('#ffffff', 0.9),
          pressed: withOpacity('#ffffff', 0.9),
          selected: withOpacity('#272727', 0.9),
        },
        background: {
          fill: {
            default: withOpacity('#ffffff', 0),
            hovered: withOpacity('#ffffff', 0.1),
            pressed: withOpacity('#ffffff', 0.2),
            selected: withOpacity('#ffffff', 0.9),
          },
          border: {
            default: withOpacity('#000000', 0),
            hovered: withOpacity('#000000', 0),
            pressed: withOpacity('#000000', 0),
            selected: withOpacity('#000000', 0),
          },
        },
        dividers: withOpacity('#ffffff', 0.1),
      },
    },
    menu: {
      title: {
        default: withOpacity('#ffffff', 0.9),
        hovered: withOpacity('#ffffff', 0.9),
        pressed: withOpacity('#ffffff', 0.9),
        selected: withOpacity('#272727', 1),
      },
      icon: {
        default: withOpacity('#ffffff', 0.9),
        hovered: withOpacity('#ffffff', 0.9),
        pressed: withOpacity('#ffffff', 0.9),
        selected: withOpacity('#272727', 1),
      },
      background: {
        fill: {
          default: withOpacity('#ffffff', 0),
          hovered: withOpacity('#ffffff', 0.1),
          pressed: withOpacity('#ffffff', 0.2),
          selected: withOpacity('#ffffff', 0.9),
        },
      },
      sectionHeader: withOpacity('#ffffff', 0.9),
      subtitle: {
        default: withOpacity('#ffffff', 0.7),
        hovered: withOpacity('#ffffff', 0.7),
        pressed: withOpacity('#ffffff', 0.7),
        selected: withOpacity('#272727', 0.9),
      },
      toggle: {
        title: {
          default: withOpacity('#ffffff', 0.9),
          hovered: withOpacity('#ffffff', 0.9),
          pressed: withOpacity('#ffffff', 0.9),
          selected: withOpacity('#ffffff', 0.9),
        },
        background: {
          fill: {
            default: withOpacity('#ffffff', 0),
            hovered: withOpacity('#ffffff', 0),
            pressed: withOpacity('#ffffff', 0),
            selected: withOpacity('#ffffff', 0),
          },
        },
        icon: {
          default: withOpacity('#ffffff', 0.9),
          hovered: withOpacity('#ffffff', 0.9),
          pressed: withOpacity('#ffffff', 0.9),
          selected: withOpacity('#ffffff', 0.9),
        },
        subtitle: {
          default: withOpacity('#ffffff', 0.7),
          hovered: withOpacity('#ffffff', 0.7),
          pressed: withOpacity('#ffffff', 0.7),
          selected: withOpacity('#ffffff', 0.7),
        },
      },
      labelIcon: {
        label: {
          default: withOpacity('#ffffff', 0.7),
          hovered: withOpacity('#ffffff', 0.7),
          pressed: withOpacity('#ffffff', 0.7),
          selected: withOpacity('#272727', 0.9),
        },
        icon: {
          default: withOpacity('#ffffff', 0.7),
          hovered: withOpacity('#ffffff', 0.7),
          pressed: withOpacity('#ffffff', 0.7),
          selected: withOpacity('#272727', 0.9),
        },
      },
    },
    sideNavigation: {
      sideNavItem: {
        label: {
          default: withOpacity('#ffffff', 0.9),
          hovered: withOpacity('#ffffff', 0.9),
          pressed: withOpacity('#ffffff', 0.9),
          selected: withOpacity('#272727', 1),
        },
        icon: {
          default: withOpacity('#ffffff', 0.9),
          hovered: withOpacity('#ffffff', 0.9),
          pressed: withOpacity('#ffffff', 0.9),
          selected: withOpacity('#272727', 1),
        },
        background: {
          fill: {
            default: withOpacity('#ffffff', 0),
            hovered: withOpacity('#ffffff', 0.1),
            pressed: withOpacity('#ffffff', 0.2),
            selected: withOpacity('#ffffff', 0.9),
          },
          border: {
            default: withOpacity('#000000', 0),
            hovered: withOpacity('#000000', 0),
            pressed: withOpacity('#000000', 0),
            selected: withOpacity('#000000', 0),
          },
        },
      },
      label: {
        label: {
          default: withOpacity('#ffffff', 0.9),
          hovered: withOpacity('#ffffff', 0.9),
          pressed: withOpacity('#ffffff', 0.9),
          selected: withOpacity('#ffffff', 0.9),
        },
        icon: {
          default: withOpacity('#ffffff', 0.9),
          hovered: withOpacity('#ffffff', 0.9),
          pressed: withOpacity('#ffffff', 0.9),
          selected: withOpacity('#ffffff', 0.9),
        },
        background: {
          fill: {
            default: withOpacity('#ffffff', 0),
            hovered: withOpacity('#ffffff', 0.1),
            pressed: withOpacity('#ffffff', 0.2),
            selected: withOpacity('#ffffff', 0),
          },
          border: {
            default: withOpacity('#000000', 0),
            hovered: withOpacity('#000000', 0),
            pressed: withOpacity('#000000', 0),
            selected: withOpacity('#000000', 0),
          },
        },
      },
    },
    badges: {
      primary: {
        background: withOpacity('#ffffff', 0.9),
        label: withOpacity('#272727', 1),
        icon: withOpacity('#272727', 1),
      },
      secondary: {
        background: withOpacity('#272727', 0.9),
        label: withOpacity('#ffffff', 0.9),
        icon: withOpacity('#ffffff', 0.9),
      },
      positive: {
        background: withOpacity('#0b8a1b', 1),
        label: withOpacity('#ffffff', 0.9),
        icon: withOpacity('#ffffff', 0.9),
      },
      background: {
        background: withOpacity('#dd1535', 1),
        label: withOpacity('#ffffff', 0.9),
        icon: withOpacity('#ffffff', 0.9),
      },
    },
    imageCards: {
      background: {
        fill: {
          default: withOpacity('#ffffff', 0),
          hovered: withOpacity('#ffffff', 0.1),
          pressed: withOpacity('#ffffff', 0.2),
          selected: withOpacity('#ffffff', 0),
        },
        border: {
          default: withOpacity('#ffffff', 0),
          hovered: withOpacity('#ffffff', 0),
          pressed: withOpacity('#ffffff', 0),
          selected: withOpacity('#ffffff', 0),
        },
      },
      label: {
        primary: withOpacity('#ffffff', 0.9),
        secondary: withOpacity('#ffffff', 0.7),
        metadata: withOpacity('#ffffff', 0.7),
        rating: {
          primary: withOpacity('#ffffff', 0.9),
          secondary: withOpacity('#ffffff', 0.7),
        },
        price: {
          primary: withOpacity('#ffffff', 0.9),
          secondary: withOpacity('#ffffff', 0.7),
        },
      },
      icon: {
        primary: withOpacity('#ffffff', 0.9),
        secondary: withOpacity('#ffffff', 0.7),
      },
    },
    tiles: {
      label: {
        onMedia: {
          primary: withOpacity('#ffffff', 0.9),
          secondary: withOpacity('#ffffff', 0.7),
        },
        primary: withOpacity('#ffffff', 0.9),
        secondary: withOpacity('#ffffff', 0.9),
      },
      icon: {
        onMedia: {
          primary: withOpacity('#ffffff', 1),
        },
        primary: withOpacity('#ffffff', 0.9),
        secondary: withOpacity('#ffffff', 0.9),
      },
      eventHeader: {
        label: {
          primary: withOpacity('#ffffff', 0.9),
          month: withOpacity('#dd1535', 1),
          date: withOpacity('#272727', 1),
        },
        background: {
          primary: withOpacity('#000000', 0.6),
          date: withOpacity('#ffffff', 0.9),
        },
        notification: {
          indicator: withOpacity('#dd1535', 1),
        },
      },
      background: {
        primary: withOpacity('#000000', 0.1),
      },
      mediaThumbnail: {
        border: withOpacity('#272727', 0.1),
      },
      check: {
        background: withOpacity('#ffffff', 0.9),
        icon: withOpacity('#272727', 1),
      },
    },
    segmentedControl: {
      background: {
        default: withOpacity('#ffffff', 0),
        hovered: withOpacity('#ffffff', 0.1),
        pressed: withOpacity('#ffffff', 0.2),
        selected: withOpacity('#ffffff', 0.9),
      },
      icon: {
        default: withOpacity('#ffffff', 0.9),
        hovered: withOpacity('#ffffff', 0.9),
        pressed: withOpacity('#ffffff', 0.9),
        selected: withOpacity('#272727', 1),
      },
      label: {
        default: withOpacity('#ffffff', 0.9),
        hovered: withOpacity('#ffffff', 0.9),
        pressed: withOpacity('#ffffff', 0.9),
        selected: withOpacity('#272727', 1),
      },
      selected: {
        background: withOpacity('#000000', 0.1),
      },
    },
    progressRing: {
      background: {
        active: withOpacity('#ffffff', 0.9),
        inactive: withOpacity('#ffffff', 0.1),
      },
      icon: {
        fill: withOpacity('#ffffff', 0.9),
      },
    },
    avatar: {
      badge: {
        active: withOpacity('#2ad116', 1),
      },
      focusRing: {
        default: withOpacity('#ffffff', 0),
        hovered: withOpacity('#ffffff', 0.1),
        pressed: withOpacity('#ffffff', 0.2),
        selected: withOpacity('#ffffff', 0.7),
      },
    },
    facepile: {
      label: withOpacity('#ffffff', 0.9),
    },
    peopleCard: {
      label: {
        secondary: withOpacity('#ffffff', 0.7),
        primary: withOpacity('#ffffff', 0.9),
        tertiary: withOpacity('#ffffff', 0.7),
      },
      badge: {
        active: withOpacity('#2ad116', 1),
      },
    },
    onMediaCheckbox: {
      background: {
        default: withOpacity('#ffffff', 0),
        hovered: withOpacity('#ffffff', 0.1),
        pressed: withOpacity('#ffffff', 0.2),
        selected: withOpacity('#ffffff', 1),
      },
      icon: {
        default: withOpacity('#ffffff', 0.9),
        hovered: withOpacity('#ffffff', 0.9),
        pressed: withOpacity('#ffffff', 0.9),
        selected: withOpacity('#272727', 1),
      },
    },
    syncButton: {
      background: {
        default: withOpacity('#ffffff', 0),
        hovered: withOpacity('#ffffff', 0.1),
        pressed: withOpacity('#ffffff', 0),
      },
      icon: {
        default: withOpacity('#ffffff', 0.9),
        hovered: withOpacity('#ffffff', 0.9),
        pressed: withOpacity('#ffffff', 0.9),
      },
      progressRing: {
        background: withOpacity('#ffffff', 0.3),
        fill: withOpacity('#ffffff', 0.9),
      },
    },
    galleryTile: {
      icon: withOpacity('#ffffff', 1),
      label: withOpacity('#ffffff', 0.9),
    },
    search: {
      label: withOpacity('#ffffff', 0.9),
      cursor: withOpacity('#64b5ff', 1),
      background: {
        default: withOpacity('#000000', 0.15),
        hovered: withOpacity('#ffffff', 0.1),
        pressed: withOpacity('#ffffff', 0.2),
        typing: withOpacity('#000000', 0.15),
      },
      icon: withOpacity('#ffffff', 0.9),
    },
    slider: {
      label: withOpacity('#ffffff', 0.7),
      background: withOpacity('#000000', 0.1),
      icon: withOpacity('#ffffff', 0.9),
      handle: {
        background: {
          hover: withOpacity('#000000', 0.1),
          pressed: withOpacity('#000000', 0.2),
          default: withOpacity('#000000', 0),
        },
        icon: withOpacity('#272727', 1),
        label: withOpacity('#272727', 1),
      },
      foreground: {
        default: withOpacity('#ffffff', 0.9),
      },
    },
    typehead: {
      icon: withOpacity('#ffffff', 0.9),
      label: withOpacity('#ffffff', 0.7),
      background: {
        default: withOpacity('#ffffff', 0),
        hovered: withOpacity('#ffffff', 0.1),
        pressed: withOpacity('#ffffff', 0.15),
      },
    },
    inputKeys: {
      letter: {
        background: {
          default: withOpacity('#ffffff', 0.05),
          pressed: withOpacity('#ffffff', 0.2),
          hovered: withOpacity('#ffffff', 0.1),
        },
        label: {
          primary: withOpacity('#ffffff', 0.9),
          secondary: withOpacity('#ffffff', 0.3),
        },
      },
      icon: {
        background: {
          default: withOpacity('#ffffff', 0.05),
          hovered: withOpacity('#ffffff', 0.1),
          pressed: withOpacity('#ffffff', 0.2),
        },
        icon: {
          default: withOpacity('#ffffff', 1),
          hovered: withOpacity('#ffffff', 1),
          pressed: withOpacity('#ffffff', 1),
        },
      },
      alt: {
        background: {
          default: withOpacity('#414141', 1),
          hovered: withOpacity('#ffffff', 0.1),
          pressed: withOpacity('#ffffff', 0.2),
        },
        label: {
          primary: withOpacity('#ffffff', 0.9),
          secondary: withOpacity('#ffffff', 0.3),
        },
      },
      primary: {
        background: {
          default: withOpacity('#ffffff', 0.9),
          hovered: withOpacity('#d9d9d9', 1),
          pressed: withOpacity('#c0c0c0', 1),
        },
        icon: {
          default: withOpacity('#272727', 1),
          hovered: withOpacity('#272727', 1),
          pressed: withOpacity('#272727', 1),
        },
      },
      spaceBar: {
        background: {
          default: withOpacity('#ffffff', 0.05),
          hovered: withOpacity('#ffffff', 0.1),
          pressed: withOpacity('#ffffff', 0.2),
        },
      },
    },
    controlBar: {
      background: {
        default: withOpacity('#414141', 1),
        spatialMinimized: {
          fill: withOpacity('#ffffff', 1),
          border: withOpacity('#ffffff', 1),
        },
      },
      label: withOpacity('#ffffff', 0.9),
    },
    inputKeyboard: {
      background: {
        fill: {
          stop1: withOpacity('#414141', 1),
          stop2: withOpacity('#272727', 1),
        },
        border: withOpacity('#ffffff', 0.1),
      },
      dividers: withOpacity('#ffffff', 0.1),
      label: withOpacity('#ffffff', 0.7),
    },
    tooltip: {
      background: {
        stop1: withOpacity('#414141', 1),
        stop2: withOpacity('#272727', 1),
      },
      icon: {
        default: withOpacity('#ffffff', 0.9),
      },
      label: {
        primary: withOpacity('#ffffff', 0.9),
        secondary: withOpacity('#ffffff', 0.7),
      },
    },
    infoCells: {
      background: withOpacity('#272727', 0.1),
      icon: withOpacity('#ffffff', 0.7),
      subheadline: withOpacity('#ffffff', 0.7),
      label: withOpacity('#ffffff', 0.7),
    },
    listCells: {
      background: {
        default: withOpacity('#000000', 0.1),
        hovered: withOpacity('#ffffff', 0.1),
        pressed: withOpacity('#ffffff', 0.2),
      },
      label: {
        primary: withOpacity('#ffffff', 0.9),
        secondary: withOpacity('#ffffff', 0.7),
        secondaryTextIcon: withOpacity('#ffffff', 0.7),
      },
      attribute: {
        primary: withOpacity('#ffffff', 0.9),
      },
    },
    auiNavigationBar: {
      background: {
        stop1: withOpacity('#414141', 1),
        stop2: withOpacity('#272727', 1),
      },
      statusElements: {
        time: withOpacity('#ffffff', 0.7),
        wifi: withOpacity('#ffffff', 0.9),
        battery: withOpacity('#ffffff', 0.9),
      },
      divider: withOpacity('#ffffff', 0.1),
    },
    achievementRow: {
      background: {
        default: withOpacity('#ffffff', 0),
      },
      label: {
        primary: withOpacity('#ffffff', 0.9),
        rating: withOpacity('#ffffff', 0.7),
        category: withOpacity('#ffffff', 0.7),
        description: withOpacity('#ffffff', 0.7),
        achievements: withOpacity('#ffffff', 0.7),
        progress: withOpacity('#ffffff', 0.9),
      },
      icon: {
        rating: withOpacity('#ffffff', 0.9),
      },
    },
    browserTab: {
      background: {
        default: withOpacity('#ffffff', 0),
        hovered: withOpacity('#ffffff', 0.1),
        pressed: withOpacity('#ffffff', 0.2),
        selected: withOpacity('#ffffff', 0.9),
      },
      label: {
        default: withOpacity('#ffffff', 0.9),
        hovered: withOpacity('#ffffff', 0.9),
        pressed: withOpacity('#ffffff', 0.9),
        selected: withOpacity('#272727', 1),
      },
    },
    browserToolBar: {
      icon: withOpacity('#ffffff', 0.7),
    },
    browserTopBar: {
      label: {
        primary: withOpacity('#ffffff', 0.9),
        secondary: withOpacity('#ffffff', 0.9),
      },
      icon: {
        primary: withOpacity('#ffffff', 0.9),
        secondary: withOpacity('#ffffff', 0.7),
      },
    },
    dialogModals: {
      background: {
        stop1: withOpacity('#414141', 1),
        stop2: withOpacity('#272727', 1),
      },
      label: {
        primary: withOpacity('#ffffff', 0.9),
        secondary: withOpacity('#ffffff', 0.7),
        link: withOpacity('#64b5ff', 1),
      },
      icon: {
        primary: withOpacity('#ffffff', 0.9),
      },
    },
    fullPanelModals: {
      background: {
        stop1: withOpacity('#414141', 1),
        stop2: withOpacity('#272727', 1),
      },
      label: {
        primary: withOpacity('#ffffff', 0.9),
        secondary: withOpacity('#ffffff', 0.7),
      },
    },
    heroImage: {
      label: {
        primary: withOpacity('#ffffff', 0.9),
        secondary: withOpacity('#ffffff', 0.7),
      },
      pagination: {
        active: withOpacity('#ffffff', 0.9),
        inactive: withOpacity('#ffffff', 0.3),
      },
    },
    listHeader: {
      label: {
        primary: withOpacity('#ffffff', 0.9),
        secondary: withOpacity('#ffffff', 0.7),
      },
    },
    mediaControls: {
      icon: {
        icon: withOpacity('#ffffff', 0.9),
        progressBar: {
          foreground: withOpacity('#ffffff', 0.9),
          background: withOpacity('#ffffff', 0.3),
        },
      },
      playButton: {
        background: withOpacity('#ffffff', 0.9),
        icon: withOpacity('#272727', 0.9),
      },
    },
    inputField: {
      label: withOpacity('#ffffff', 0.7),
      icon: withOpacity('#ffffff', 0.7),
      inputField: withOpacity('#ffffff', 0.05),
      background: {
        default: withOpacity('#ffffff', 0.05),
        hovered: withOpacity('#ffffff', 0.1),
        pressed: withOpacity('#ffffff', 0.2),
      },
    },
    popover: {
      label: {
        primary: withOpacity('#ffffff', 0.9),
        secondary: withOpacity('#ffffff', 0.7),
      },
      background: {
        stop1: withOpacity('#414141', 1),
        stop2: withOpacity('#272727', 1),
      },
      icon: withOpacity('#ffffff', 0.9),
    },
    sectionHeader: {
      label: {
        primary: withOpacity('#ffffff', 0.9),
        secondary: withOpacity('#ffffff', 0.7),
      },
    },
    scrollbars: {
      background: {
        fill: withOpacity('#ffffff', 0.9),
      },
    },
    bottomButton: {
      label: {
        primary: withOpacity('#ffffff', 0.7),
        link: withOpacity('#64b5ff', 1),
      },
    },
    sidesheet: {
      background: {
        stop1: withOpacity('#414141', 1),
        stop2: withOpacity('#272727', 1),
      },
      label: {
        primary: withOpacity('#ffffff', 0.9),
        secondary: withOpacity('#ffffff', 0.7),
      },
      divider: withOpacity('#ffffff', 0.1),
    },
    toast: {
      toast: {
        background: {
          stop1: withOpacity('#414141', 1),
          stop2: withOpacity('#272727', 1),
          delete: withOpacity('#dd1535', 1),
          label: {
            primary: withOpacity('#ffffff', 0.9),
            secondary: withOpacity('#ffffff', 0.7),
          },
          icon: {
            primary: withOpacity('#ffffff', 0.9),
          },
        },
        slider: {
          background: withOpacity('#000000', 0.1),
          forground: withOpacity('#ffffff', 0.9),
        },
      },
    },
    reactionPill: {
      background: {
        border: {
          stop1: withOpacity('#414141', 1),
          stop2: withOpacity('#272727', 1),
        },
        fill: withOpacity('#272727', 1),
      },
      label: withOpacity('#ffffff', 1),
    },
    chatBubble: {
      sender: {
        fill: withOpacity('#ffffff', 1),
        label: withOpacity('#272727', 1),
      },
      responder: {
        fill: withOpacity('#272727', 1),
        label: withOpacity('#ffffff', 1),
      },
    },
    avatarTile: {
      background: withOpacity('#000000', 0.1),
      selectedBorder: withOpacity('#ffffff', 0.9),
      label: {
        primary: withOpacity('#ffffff', 0.9),
        secondary: withOpacity('#ffffff', 0.7),
      },
      multiselect: {
        background: withOpacity('#ffffff', 1),
        icon: withOpacity('#272727', 1),
        border: withOpacity('#414141', 1),
      },
      icon: withOpacity('#ffffff', 0.9),
      reward: {
        background: withOpacity('#000000', 0.1),
        gradient: withOpacity('#9c94f8', 1),
        label: {
          primary: withOpacity('#ffffff', 0.9),
          secondary: withOpacity('#ffffff', 0.7),
        },
        slider: {
          background: withOpacity('#e2e4ea', 1),
          foreground: withOpacity('#6441d2', 1),
        },
        icon: withOpacity('#ffffff', 0.7),
      },
    },
    avatarSideNav: {
      background: {
        default: withOpacity('#ffffff', 0),
        hovered: withOpacity('#ffffff', 0.1),
        selected: withOpacity('#ffffff', 0.9),
      },
      icon: {
        default: withOpacity('#ffffff', 0.9),
        hovered: withOpacity('#ffffff', 0.9),
        selected: withOpacity('#272727', 1),
      },
      attribute: {
        default: withOpacity('#ffffff', 0.9),
        hovered: withOpacity('#ffffff', 0.9),
        selected: withOpacity('#272727', 1),
      },
      label: {
        default: withOpacity('#ffffff', 0.9),
        hovered: withOpacity('#ffffff', 0.9),
        selected: withOpacity('#272727', 0.9),
      },
    },
    avatarLoader: {
      fill: withOpacity('#ffffff', 0.9),
      background: withOpacity('#ffffff', 0.1),
    },
    avatarColorPickerSwatch: {
      selectedState: withOpacity('#ffffff', 0.9),
      icon: withOpacity('#ffffff', 0.9),
      noneBackground: withOpacity('#272727', 1),
    },
    avatarSlider: {
      label: withOpacity('#ffffff', 0.9),
      icon: withOpacity('#ffffff', 0.7),
      slider: {
        background: withOpacity('#000000', 0.1),
        label: withOpacity('#ffffff', 0.7),
        icon: withOpacity('#ffffff', 0.9),
        foreground: {
          default: withOpacity('#ffffff', 0.9),
        },
        handle: {
          icon: withOpacity('#272727', 1),
          label: withOpacity('#272727', 1),
        },
      },
      background: withOpacity('#000000', 0.1),
    },
    avatarSectionHeader: {
      label: {
        primary: withOpacity('#ffffff', 0.9),
        secondary: withOpacity('#ffffff', 0.7),
      },
      icon: withOpacity('#ffffff', 0.9),
    },
    avatarSegmentedControl: {
      background: {
        chips: {
          default: withOpacity('#ffffff', 0),
          hovered: withOpacity('#ffffff', 0.1),
          pressed: withOpacity('#ffffff', 0.2),
          selected: withOpacity('#ffffff', 0.9),
        },
        picker: {
          default: withOpacity('#000000', 0.1),
        },
      },
      icon: {
        default: withOpacity('#ffffff', 0.7),
        hovered: withOpacity('#ffffff', 0.8),
        pressed: withOpacity('#ffffff', 0.9),
        selected: withOpacity('#272727', 1),
      },
      label: {
        default: withOpacity('#ffffff', 0.7),
        hovered: withOpacity('#ffffff', 0.7),
        pressed: withOpacity('#ffffff', 0.7),
        selected: withOpacity('#272727', 0.9),
      },
      selected: {
        background: withOpacity('#000000', 0.1),
      },
    },
    emptyStateIllustration: {
      icon: {
        primary: withOpacity('#ffffff', 0.5),
        secondary: withOpacity('#ffffff', 0.9),
      },
      abstractStars: withOpacity('#ffffff', 0.15),
      shimmer: withOpacity('#ffffff', 0.1),
    },
    navigationOverflowMenu: {
      label: {
        default: withOpacity('#ffffff', 0.9),
        hovered: withOpacity('#ffffff', 0.9),
        pressed: withOpacity('#ffffff', 0.9),
        selected: withOpacity('#272727', 1),
        disabled: withOpacity('#ffffff', 0.1),
      },
      icon: {
        default: withOpacity('#ffffff', 0.9),
        hovered: withOpacity('#ffffff', 0.9),
        pressed: withOpacity('#ffffff', 0.9),
        selected: withOpacity('#272727', 1),
        disabled: withOpacity('#ffffff', 0.1),
      },
      background: {
        fill: {
          default: withOpacity('#ffffff', 0),
          hovered: withOpacity('#ffffff', 0.1),
          pressed: withOpacity('#ffffff', 0.2),
          selected: withOpacity('#ffffff', 0.9),
          disabled: withOpacity('#272727', 0),
        },
        border: {
          default: withOpacity('#000000', 0),
          hovered: withOpacity('#000000', 0),
          pressed: withOpacity('#000000', 0),
          selected: withOpacity('#000000', 0),
        },
      },
    },
    navigationSystemBar: {
      elementsButton: {
        icon: {
          default: withOpacity('#ffffff', 1),
          hover: withOpacity('#ffffff', 1),
          pressed: withOpacity('#ffffff', 1),
          active: withOpacity('#ffffff', 1),
          green: withOpacity('#ffffff', 1),
          blue: withOpacity('#ffffff', 1),
          withBadge: withOpacity('#ffffff', 1),
          withStatus: withOpacity('#ffffff', 1),
          privacyOn: withOpacity('#ffffff', 1),
          open: withOpacity('#ffffff', 1),
          recording: withOpacity('#ffffff', 1),
        },
        fill: {
          default: withOpacity('#ffffff', 1),
          hover: withOpacity('#ffffff', 1),
          pressed: withOpacity('#ffffff', 1),
          active: withOpacity('#ffffff', 1),
          withBadge: withOpacity('#ffffff', 1),
          withStatus: withOpacity('#ffffff', 1),
          privacyOn: withOpacity('#ffffff', 1),
          open: withOpacity('#ffffff', 1),
          recording: withOpacity('#ffffff', 1),
          number: withOpacity('#ffffff', 1),
          status: withOpacity('#ffffff', 1),
        },
        green: {
          stop1: withOpacity('#ffffff', 1),
          stop2: withOpacity('#ffffff', 1),
          stop3: withOpacity('#ffffff', 1),
        },
        blue: {
          stop1: withOpacity('#ffffff', 1),
          stop2: withOpacity('#ffffff', 1),
          stop3: withOpacity('#ffffff', 1),
        },
        number: {
          label: withOpacity('#ffffff', 1),
        },
        badge: {
          fill: {
            privacyOn: withOpacity('#ffffff', 1),
            open: withOpacity('#ffffff', 1),
            recording: withOpacity('#ffffff', 1),
          },
        },
        background: {
          default: withOpacity('#ffffff', 1),
          hover: withOpacity('#ffffff', 1),
          pressed: withOpacity('#ffffff', 1),
          active: withOpacity('#ffffff', 1),
        },
      },
      personalDisplayBar: {
        chin: withOpacity('#ffffff', 1),
        defaultElementsButton: withOpacity('#ffffff', 1),
      },
      navigationChevron: {
        chevron: withOpacity('#ffffff', 1),
        fill: {
          default: withOpacity('#ffffff', 1),
          hover: withOpacity('#ffffff', 1),
        },
      },
      dividers: withOpacity('#ffffff', 1),
      time: withOpacity('#ffffff', 1),
      worldPillButton: {
        background: {
          default: withOpacity('#ffffff', 1),
        },
      },
      appPillButton: {
        background: {
          default: withOpacity('#ffffff', 1),
        },
      },
      avatarPillButton: {
        background: {
          default: withOpacity('#ffffff', 1),
          hover: withOpacity('#ffffff', 1),
        },
      },
      homeIcon: {
        background: {
          default: withOpacity('#ffffff', 1),
          hover: withOpacity('#ffffff', 1),
        },
        icon: withOpacity('#ffffff', 1),
      },
      sectionHeader: withOpacity('#ffffff', 1),
    },
    textInput: {
      label: {
        default: withOpacity('#ffffff', 0.9),
        hover: withOpacity('#ffffff', 0.9),
        pressed: withOpacity('#ffffff', 0.9),
        typing: withOpacity('#ffffff', 1),
      },
      cursor: withOpacity('#64b5ff', 1),
      icon: withOpacity('#ffffff', 0.7),
      background: {
        default: withOpacity('#ffffff', 0.05),
        hovered: withOpacity('#ffffff', 0.1),
        pressed: withOpacity('#ffffff', 0.2),
        typing: withOpacity('#ffffff', 0.05),
      },
    },
    navigationAppTile: {
      label: {
        primary: withOpacity('#ffffff', 1),
        secondary: withOpacity('#ffffff', 1),
      },
      attribute: withOpacity('#ffffff', 1),
      activeIndicator: withOpacity('#ffffff', 1),
      navigationUninstalledStates: {
        label: withOpacity('#ffffff', 1),
        iconButton: {
          download: {
            fill: withOpacity('#ffffff', 1),
            icon: withOpacity('#ffffff', 1),
          },
          queued: {
            stroke: withOpacity('#ffffff', 1),
          },
          queuedHover: {
            icon: withOpacity('#ffffff', 1),
            fill: withOpacity('#ffffff', 1),
          },
          cancel: {
            icon: withOpacity('#ffffff', 1),
            fill: withOpacity('#ffffff', 1),
          },
          downloadingProgress: {
            stroke: {
              inactiveStroke: withOpacity('#ffffff', 1),
              activeStroke: withOpacity('#ffffff', 1),
            },
          },
          installing: {
            stroke: {
              activeStroke: withOpacity('#ffffff', 1),
            },
          },
          redeem: {
            icon: withOpacity('#ffffff', 1),
            fill: withOpacity('#ffffff', 1),
          },
          view: {
            icon: withOpacity('#ffffff', 1),
            fill: withOpacity('#ffffff', 1),
          },
          update: {
            icon: withOpacity('#ffffff', 1),
            fill: withOpacity('#ffffff', 1),
          },
        },
      },
      uninstalledScrim: withOpacity('#ffffff', 1),
    },
    semantic: {
      ui: {
        focusring: {
          default: withOpacity('#ffffff', 0),
          hovered: withOpacity('#ffffff', 0.1),
          pressed: withOpacity('#ffffff', 0.2),
          selected: withOpacity('#ffffff', 0.7),
        },
        primary: {
          text: withOpacity('#272727', 1),
          icon: withOpacity('#272727', 1),
          background: {
            default: withOpacity('#ffffff', 0.9),
            hovered: withOpacity('#d9d9d9', 1),
            pressed: withOpacity('#c0c0c0', 1),
          },
        },
        secondary: {
          text: withOpacity('#ffffff', 0.9),
          icon: withOpacity('#ffffff', 0.9),
          background: {
            default: withOpacity('#ffffff', 0.05),
            hovered: withOpacity('#ffffff', 0.1),
            pressed: withOpacity('#ffffff', 0.2),
          },
        },
        tertiary: {
          text: withOpacity('#ffffff', 0.9),
          icon: withOpacity('#ffffff', 0.9),
          background: {
            default: withOpacity('#ffffff', 0),
            hovered: withOpacity('#ffffff', 0.1),
            pressed: withOpacity('#ffffff', 0.15),
          },
        },
        disabled: {
          text: withOpacity('#8e8e8e', 1),
          icon: withOpacity('#8e8e8e', 1),
          background: {
            default: withOpacity('#5a5a5a', 1),
            hovered: withOpacity('#5a5a5a', 1),
            pressed: withOpacity('#5a5a5a', 1),
          },
        },
        selected: {
          text: withOpacity('#272727', 1),
          icon: withOpacity('#272727', 1),
          background: {
            default: withOpacity('#ffffff', 1),
            hovered: withOpacity('#f2f2f2', 1),
            pressed: withOpacity('#d9d9d9', 1),
          },
        },
        deselected: {
          text: withOpacity('#ffffff', 0.9),
          icon: withOpacity('#ffffff', 0.9),
          background: {
            default: withOpacity('#ffffff', 0.05),
            hovered: withOpacity('#ffffff', 0.1),
            pressed: withOpacity('#ffffff', 0.15),
          },
        },
        onMedia: {
          text: withOpacity('#f2f2f2', 1),
          icon: withOpacity('#f2f2f2', 1),
          background: {
            default: withOpacity('#ffffff', 0),
            hovered: withOpacity('#ffffff', 0.1),
            pressed: withOpacity('#ffffff', 0.2),
          },
        },
      },
      status: {
        notification: withOpacity('#64b5ff', 1),
        hidden: withOpacity('#8e8e8e', 1),
        positive: withOpacity('#2ad116', 1),
        negative: withOpacity('#f7818c', 1),
        warning: withOpacity('#fc9435', 1),
        privacy: withOpacity('#9c94f8', 1),
      },
      text: {
        primary: withOpacity('#ffffff', 0.9),
        secondary: withOpacity('#ffffff', 0.7),
        placeholder: withOpacity('#ffffff', 0.3),
        disabled: withOpacity('#ffffff', 0.3),
        link: withOpacity('#64b5ff', 1),
        positive: withOpacity('#2ad116', 1),
        negative: withOpacity('#f7818c', 1),
        warning: withOpacity('#fc9435', 1),
        primaryOnMedia: withOpacity('#ffffff', 0.9),
        secondaryOnMedia: withOpacity('#ffffff', 0.7),
      },
      icon: {
        primary: withOpacity('#ffffff', 0.9),
        secondary: withOpacity('#ffffff', 0.7),
        placeholder: withOpacity('#ffffff', 0.3),
        disabled: withOpacity('#ffffff', 0.3),
        positive: withOpacity('#2ad116', 1),
        negative: withOpacity('#f7818c', 1),
        warning: withOpacity('#fc9435', 1),
        onMedia: withOpacity('#ffffff', 0.9),
        secondaryOnMedia: withOpacity('#ffffff', 0.7),
      },
      background: {
        primary: {
          stop1: withOpacity('#414141', 1),
          stop2: withOpacity('#272727', 1),
        },
        positive: withOpacity('#2ad116', 1),
        negative: withOpacity('#f7818c', 1),
        privacy: withOpacity('#9c94f8', 1),
        ui: {
          primary: withOpacity('#ffffff', 0.9),
          secondary: withOpacity('#ffffff', 0.05),
        },
      },
      shadows: {
        punchedIn: {
          dropShadow: withOpacity('#ffffff', 0.1),
          innerShadow: withOpacity('#000000', 0.1),
        },
        beveled: {
          left: withOpacity('#ffffff', 0.1),
          right: withOpacity('#000000', 0.1),
        },
        dropShadow: {
          innerShadow: {
            left: withOpacity('#ffffff', 0.1),
            right: withOpacity('#000000', 0.1),
          },
          dropShadow: {
            top: withOpacity('#000000', 0.1),
            bottom: withOpacity('#000000', 0.2),
          },
        },
        panel: {
          innerShadow: withOpacity('#000000', 0.1),
          innerShadow2: withOpacity('#ffffff', 0.1),
        },
      },
    },
  },
} as const

function merge(light: any, dark: any) {
  const isSignal = (v: any): v is Signal => v instanceof Signal
  const isPlainObject = (v: any) => v != null && typeof v === 'object' && !isSignal(v)

  // Leaf nodes or mismatched structures: return a reactive chooser
  if (!isPlainObject(light) || !isPlainObject(dark)) {
    return computed(() => {
      const l = isSignal(light) ? light.value : light
      const d = isSignal(dark) ? (dark as Signal).value : dark
      return isDarkMode.value ? d : l
    })
  }

  const result: any = {}
  const keys = new Set([...Object.keys(light || {}), ...Object.keys(dark || {})])
  for (const key of keys) {
    result[key] = merge(light[key], dark?.[key])
  }
  return result
}

export const theme = merge(lightTheme, darkTheme) as unknown as typeof lightTheme
